/********* ChabokPush.m Cordova Plugin Implementation *******/

#import <Cordova/CDV.h>
#import <Foundation/Foundation.h>
#import <AdpPushClient/AdpPushClient.h>

id <CDVCommandDelegate> pluginCommandDelegate;

void successCallback(NSString* callbackId, NSDictionary* data) {
    CDVPluginResult* commandResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:data];
    commandResult.keepCallback = @1;
    [pluginCommandDelegate sendPluginResult:commandResult callbackId:callbackId];
}

void failureCallback(NSString* callbackId, NSDictionary* data) {
    CDVPluginResult* commandResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:data];
    commandResult.keepCallback = @1;
    [pluginCommandDelegate sendPluginResult:commandResult callbackId:callbackId];
}

@interface PushClientManager(PushManager)
-(NSString *) getMessageIdFromPayload:(NSDictionary *)payload;
@end

@interface ChabokPush : CDVPlugin <PushClientManagerDelegate> {
    NSString * _onMessageCallback;
    NSString * _onRegisterCallback;
    NSString * _onConnectionStatusCallback;
}
  // Member variables go here.
@property (nonatomic, retain) NSString *appId;

@property (class) NSDictionary* coldStartNotificationResult;

@property (nonatomic, retain) NSString *onMessageCallback;
@property (nonatomic, retain) NSString *onRegisterCallback;
@property (nonatomic, retain) NSString *onConnectionStatusCallback;
@property (nonatomic, retain) NSString *onNotificationOpenedCallback;

-(void) configureEnvironment:(CDVInvokedUrlCommand *)command;
-(void) login:(CDVInvokedUrlCommand *)command;
-(void) logout:(CDVInvokedUrlCommand *)command;

-(void) getUserId:(CDVInvokedUrlCommand *) command;
-(void) getInstallationId:(CDVInvokedUrlCommand *) command;

-(void) addTag:(CDVInvokedUrlCommand *) command;
-(void) removeTag:(CDVInvokedUrlCommand *) command;

-(void) publish:(CDVInvokedUrlCommand *) command;
-(void) resetBadge:(CDVInvokedUrlCommand *) command;
-(void) track:(CDVInvokedUrlCommand *) command;
-(void) trackPurchase:(CDVInvokedUrlCommand *) command;
-(void) setDefaultTracker:(CDVInvokedUrlCommand *) command;

-(void) setUserAttributes:(CDVInvokedUrlCommand *) command;
-(void) incrementUserAttribute:(CDVInvokedUrlCommand *) command;
-(void) decrementUserAttribute:(CDVInvokedUrlCommand *) command;

@end

@implementation ChabokPush

@synthesize onMessageCallback = _onMessageCallback;
@synthesize onRegisterCallback = _onRegisterCallback;
@synthesize onConnectionStatusCallback = _onConnectionStatusCallback;
@synthesize onNotificationOpenedCallback = _onNotificationOpenedCallback;

@dynamic coldStartNotificationResult;
static NSDictionary* _coldStartNotificationResult;
NSString* _lastNotificationId;
PushClientMessage* _lastChabokMessage;

-(void)pluginInitialize {
    NSLog(@"Starting Chabok plugin");
    [PushClientManager.defaultManager addDelegate:self];
}
-(void)configureEnvironment:(CDVInvokedUrlCommand*)command {
    BOOL devMode = [[command.arguments objectAtIndex:0] boolValue];
    NSInteger chabokEnv = devMode ? 0 : 1;

    [PushClientManager.defaultManager addDelegate:self];
    [PushClientManager.defaultManager setLogLevel:ChabokLogLevelVerbose];

    BOOL state = [PushClientManager.defaultManager configureEnvironment:chabokEnv];

    CDVPluginResult* pluginResult = nil;
    if (state) {
        NSString *msg = @"Initilized sucessfully";


        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:msg];
    } else {
        NSString *msg = @"Could not init chabok parameters";

        NSLog(@"%@", msg);
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:msg];
    }

    if (!command.callbackId) {
        return;
    }

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

#pragma mark - Register

-(void)login:(CDVInvokedUrlCommand*)command {
    CDVPluginResult* pluginResult = nil;

    NSString *userId = [command.arguments objectAtIndex:0];
    if (!userId || [userId isEqual:[NSNull null]]){
        NSString *msg = @"Could not register userId to chabok";

        NSLog(@"%@", msg);
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:msg];
        return;
    }

    [PushClientManager.defaultManager login:userId
                                                       handler:^(BOOL isRegistered, NSError *error) {
                                                           CDVPluginResult* pluginResult = nil;

                                                           NSLog(@"isRegistered : %d userId : %@ error : %@",isRegistered, userId, error);

                                                           if (error) {
                                                               if (command.callbackId) {
                                                                   NSDictionary *jsonDic = @{@"registered": @(NO),
                                                                                            @"error": error
                                                                                            };
                                                                   NSString *json = [self dictionaryToJson:jsonDic];

                                                                   pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:json];

                                                                   [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
                                                               }

                                                               if (_onRegisterCallback){
                                                                   successCallback(_onRegisterCallback, @(false));
                                                               }
                                                           } else {

                                                               if (command.callbackId) {
                                                                   NSDictionary *jsonDic = @{@"registered": @(YES)};
                                                                   NSString *json = [self dictionaryToJson:jsonDic];

                                                                   pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:json];

                                                                   [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
                                                               }
                                                               if (_onRegisterCallback){
                                                                   successCallback(_onRegisterCallback, @(true));
                                                               }
                                                           }
                                                       }];
}

#pragma mark - unregister

-(void) logout:(CDVInvokedUrlCommand*)command {
    [PushClientManager.defaultManager logout];
}

#pragma mark - user
-(void) getInstallationId:(CDVInvokedUrlCommand*) command {
    CDVPluginResult* pluginResult = nil;

    NSString *installationId = [PushClientManager.defaultManager getInstallationId];
    if (!installationId) {
        NSString *msg = @"The installationId is null, You didn't register yet!";

        NSLog(@"%@", msg);
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:msg];
    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:installationId];
    }

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

-(void) getUserId:(CDVInvokedUrlCommand*) command {
    NSLog(@"getUserId = %@", command.callbackId);
    CDVPluginResult* pluginResult = nil;

    NSString *userId = [PushClientManager.defaultManager userId];
    if (!userId) {
        NSString *msg = @"The userId is null, You didn't register yet!";

        NSLog(@"%@", msg);
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:msg];
    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:userId];
    }

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

#pragma mark - tags

-(void) addTag:(CDVInvokedUrlCommand *) command {
    CDVPluginResult* pluginResult = nil;

    NSString *tagName = [command.arguments objectAtIndex:0];

    //TODO: This should handle in android sdk
    if (![PushClientManager.defaultManager getInstallationId]) {
        if (!command.callbackId) {
            return;
        }

        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"UserId not registered yet."];

        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        return;
    }

    [PushClientManager.defaultManager addTag:tagName
                                     success:^(NSInteger count) {
                                         if (!command.callbackId) {
                                             return;
                                         }
                                         NSDictionary *jsonDic = @{@"count": @(count)};
                                         NSString *json = [self dictionaryToJson:jsonDic];

                                         CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:json];

                                         [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
                                     } failure:^(NSError *error) {
                                         if (!command.callbackId) {
                                             return;
                                         }

                                         CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error.localizedDescription];

                                         [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
                                     }];
}

-(void) removeTag:(CDVInvokedUrlCommand *) command {
    CDVPluginResult* pluginResult = nil;

    NSString *tagName = [command.arguments objectAtIndex:0];

    [PushClientManager.defaultManager removeTag:tagName
                                     success:^(NSInteger count) {
                                         if (!command.callbackId) {
                                             return;
                                         }

                                         NSDictionary *jsonDic = @{@"count": @(count)};
                                         NSString *json = [self dictionaryToJson:jsonDic];

                                         CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:json];

                                         [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
                                     } failure:^(NSError *error) {
                                         if (!command.callbackId) {
                                             return;
                                         }

                                         CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error.localizedDescription];

                                         [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
                                     }];
}

#pragma mark - publish

-(void) publish:(CDVInvokedUrlCommand *) command{
    CDVPluginResult* pluginResult = nil;

    NSDictionary *message = [command.arguments objectAtIndex:0];

    NSDictionary *data = [message valueForKey:@"data"];
    NSString *userId = [message valueForKey:@"userId"];
    NSString *content = [message valueForKey:@"content"];
    NSString *channel = [message valueForKey:@"channel"];

    PushClientMessage *chabokMessage;
    if (data) {
        chabokMessage = [[PushClientMessage alloc] initWithMessage:content withData:data toUserId:userId channel:channel];
    } else {
        chabokMessage = [[PushClientMessage alloc] initWithMessage:content toUserId:userId channel:channel];
    }

    BOOL publishState = [PushClientManager.defaultManager publish:chabokMessage];

    if (publishState) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
    }

    if (!command.callbackId) {
        return;
    }

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

#pragma mark - badge
-(void) resetBadge:(CDVInvokedUrlCommand *) command {
    [PushClientManager resetBadge];
}

#pragma mark - track
-(void) track:(CDVInvokedUrlCommand *) command {
    NSLog(@"chabokpush ----------- Track event called");
    NSString *trackName = [command.arguments objectAtIndex:0];
    NSDictionary *trackData = [command.arguments objectAtIndex:1];

    [PushClientManager.defaultManager track:trackName data:[AdpPushClient getFormattedData:trackData]];
}

-(void) trackPurchase:(CDVInvokedUrlCommand *) command {
    NSLog(@"chabokpush ----------- TrackPurchase event called");
    NSString *eventName = [command.arguments objectAtIndex:0];
    NSDictionary *data = [command.arguments objectAtIndex:1];

    ChabokEvent *chabokEvent = [[ChabokEvent alloc] init];

    if (![data valueForKey:@"revenue"]) {
        [NSException raise:@"Invalid revenue" format:@"Please provide a revenue."];
    }
    chabokEvent.revenue = [[data valueForKey:@"revenue"] doubleValue];
    if ([data valueForKey:@"currency"]) {
        chabokEvent.currency = [data valueForKey:@"currency"];
    }
    if ([data valueForKey:@"data"]) {
        chabokEvent.data = [AdpPushClient getFormattedData:[data valueForKey:@"data"]];
    }
    
    [PushClientManager.defaultManager trackPurchase:eventName
                                      chabokEvent:chabokEvent];
}

#pragma mark - default tracker
-(void) setDefaultTracker:(CDVInvokedUrlCommand *) command {
    NSString *defaultTracker = [command.arguments objectAtIndex:0];

    [PushClientManager.defaultManager setDefaultTracker:defaultTracker];;
}

#pragma mark - userInfo
-(void) setUserAttributes:(CDVInvokedUrlCommand *) command {
    NSDictionary *userInfo = [command.arguments objectAtIndex:0];

    [PushClientManager.defaultManager setUserAttributes:[AdpPushClient getFormattedData:userInfo]];
}

-(void) unsetUserAttribute:(CDVInvokedUrlCommand *) command {
    NSString *attribute = [command.arguments objectAtIndex:0];

    [PushClientManager.defaultManager unsetUserAttribute:attribute];
}

-(void) incrementUserAttribute:(CDVInvokedUrlCommand *) command {
    NSString *attribute = [command.arguments objectAtIndex:0];
    NSInteger value = [command.arguments objectAtIndex:0];

    [PushClientManager.defaultManager incrementUserAttribute:attribute value:value];
}

-(void) decrementUserAttribute:(CDVInvokedUrlCommand *) command {
    NSString *attribute = [command.arguments objectAtIndex:0];
    NSInteger value = [command.arguments objectAtIndex:0];

    [PushClientManager.defaultManager incrementUserAttribute:attribute value:(value * -1)];
}

-(void) getUserAttributes:(CDVInvokedUrlCommand *) command {
    CDVPluginResult* pluginResult = nil;
    NSDictionary *userInfo = PushClientManager.defaultManager.userAttributes;

    NSString *json = [self dictionaryToJson:userInfo];

    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:json];
    if (!command.callbackId) {
        return;
    }
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

#pragma mark - deeplink
-(void) appWillOpenUrl:(CDVInvokedUrlCommand *) command {
    // CDVPluginResult* pluginResult = nil;
    // NSString *link = [command.arguments objectAtIndex:0];

    // if(!link){
    //     return;
    // }

    // NSURL *url = [[NSURL alloc] initWithString:link];
    // [PushClientManager.defaultManager appWillOpenUrl:url];
}

//-(void) setNotificationOpenedHandler:(CDVInvokedUrlCommand *) command {
//    CDVPluginResult* pluginResult = nil;
//
//    [self sendEventWithName:@"notificationOpened" body:_coldStartNotificationResult];
//}

#pragma mark - callback
-(void) setOnMessageCallback:(CDVInvokedUrlCommand *) command{
    if ([command isKindOfClass:[NSString class]]) {
           _onMessageCallback = command;
       } else {
           _onMessageCallback = command.callbackId;
       }

    if (_onMessageCallback && _lastChabokMessage) {
        [self pushClientManagerDidReceivedMessage:_lastChabokMessage];
    }
}

-(void) setOnRegisterCallback:(CDVInvokedUrlCommand *) command{
    if ([command isKindOfClass:[NSString class]]) {
        _onRegisterCallback = command;
    } else {
        _onRegisterCallback = command.callbackId;
    }
}

-(void) setOnConnectionStatusCallback:(CDVInvokedUrlCommand *) command {
    if ([command isKindOfClass:[NSString class]]) {
        _onConnectionStatusCallback = command;
    } else {
        _onConnectionStatusCallback = command.callbackId;
    }
    [self sendConnectionStatus];
}

-(void) setOnNotificationOpenedCallback:(CDVInvokedUrlCommand *) command{
    if ([command isKindOfClass:[NSString class]]) {
        _onNotificationOpenedCallback = command;
    } else {
        _onNotificationOpenedCallback = command.callbackId;
    }

    NSDictionary *lastNotification = [PushClientManager.defaultManager lastNotificationAction];
    if (lastNotification) {
        NSString *actionId = lastNotification[@"actionId"];
        if (!actionId) {
            actionId = [lastNotification[@"actionType"] lowercaseString];
            if ([actionId containsString:@"opened"]) {
                if (@available(iOS 10.0, *)) {
                    actionId = UNNotificationDefaultActionIdentifier;
                }
            } else {
                if (@available(iOS 10.0, *)) {
                    actionId = UNNotificationDismissActionIdentifier;
                }
            }
        }
        // prepare last notification
        [ChabokPush notificationOpened:[PushClientManager.defaultManager lastNotificationData]
        actionId:actionId];

        // send notification event
        [self handleNotificationOpened];
    }
}

-(void) handleNotificationOpened {
    NSDictionary *payload = (NSDictionary *)[_coldStartNotificationResult valueForKey:@"message"];
    if (payload) {
        NSString *messageId = [PushClientManager.defaultManager getMessageIdFromPayload:payload];
        if (_coldStartNotificationResult && messageId && (!_lastNotificationId || ![_lastNotificationId isEqualToString:messageId])) {
            _lastNotificationId = messageId;

            if (_onNotificationOpenedCallback) {
                CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:payload];
                [result setKeepCallbackAsBool:YES];
                [self.commandDelegate sendPluginResult:result callbackId:_onNotificationOpenedCallback];
            }
            _coldStartNotificationResult = nil;
        }
    }
}

+(NSDictionary *) notificationOpened:(NSDictionary *) payload actionId:(NSString *) actionId {
    NSString *actionType;
    NSString *actionUrl;
    NSString *actionIdStr = actionId;
    NSArray *actions = [payload valueForKey:@"actions"];
    NSString *clickUrl = [payload valueForKey:@"clickUrl"];

    if (@available(iOS 10.0, *)) {
        if ([actionId containsString:UNNotificationDismissActionIdentifier]) {
            actionType = @"dismissed";
            actionIdStr = nil;
        } else if ([actionId containsString:UNNotificationDefaultActionIdentifier]) {
            actionType = @"opened";
            actionIdStr = nil;
        }
    } else {
        actionType = @"action_taken";
        actionIdStr = actionId;

        if (actionIdStr || !actions) {
            actionUrl = [ChabokPush getActionUrlFrom:actionIdStr actions:actions];
        }
    }

    NSMutableDictionary *notificationData = [NSMutableDictionary new];

    if (actionType) {
        [notificationData setObject:actionType forKey:@"actionType"];
    }

    if (actionIdStr) {
        [notificationData setObject:actionIdStr forKey:@"actionId"];
    }

    if (actionUrl) {
        [notificationData setObject:actionUrl forKey:@"actionUrl"];
    } else if (clickUrl) {
        [notificationData setObject:clickUrl forKey:@"actionUrl"];
    }

    if (!payload) {
        _coldStartNotificationResult = nil;
        return notificationData;
    }

    [notificationData setObject:payload forKey:@"message"];

    _coldStartNotificationResult = notificationData;

    return notificationData;
}

+(NSString *) getActionUrlFrom:(NSString *)actionId actions:(NSArray *)actions {
    NSString *actionUrl;
    for (NSDictionary *action in actions) {
        NSString *acId = [action valueForKey:@"id"];
        if ([acId containsString:actionId]) {
            actionUrl = [action valueForKey:@"url"];
        }
    }
    return actionUrl;
}

-(void) sendConnectionStatus {
    NSString *connectionState = @"";
    if (PushClientManager.defaultManager.connectionState == PushClientServerConnectedState) {
        connectionState = @"CONNECTED";
    } else if (PushClientManager.defaultManager.connectionState == PushClientServerConnectingState ||
               PushClientManager.defaultManager.connectionState == PushClientServerConnectingStartState) {
        connectionState = @"CONNECTING";
    } else if (PushClientManager.defaultManager.connectionState == PushClientServerDisconnectedState ||
               PushClientManager.defaultManager.connectionState == PushClientServerDisconnectedErrorState) {
        connectionState = @"DISCONNECTED";
    } else  if (PushClientManager.defaultManager.connectionState == PushClientServerSocketTimeoutState) {
        connectionState = @"SocketTimeout";
    } else {
        connectionState = @"NOT_INITIALIZED";
    }

    if (_onConnectionStatusCallback) {
        NSLog(@"_onConnectionStatusCallback = %@. connectionState = %@",_onConnectionStatusCallback, connectionState);
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:connectionState];
        [result setKeepCallbackAsBool:YES];
        [self.commandDelegate sendPluginResult:result callbackId:_onConnectionStatusCallback];
    }
}


#pragma mark - delegate method
-(void) userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler API_AVAILABLE(ios(10.0)) API_AVAILABLE(ios(10.0)) {
    [ChabokPush notificationOpened:response.notification.request.content.userInfo actionId:response.actionIdentifier];

    [self handleNotificationOpened];

}

-(void) pushClientManagerDidChangedServerConnectionState {
    [self sendConnectionStatus];
}

-(void) pushClientManagerDidReceivedMessage:(PushClientMessage *)message{
    NSMutableDictionary *messageDict = [NSMutableDictionary.alloc initWithDictionary:[message toDict]];
    [messageDict setObject:message.channel forKey:@"channel"];

    if (_onMessageCallback) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:messageDict];
        [result setKeepCallbackAsBool:YES];
        [self.commandDelegate sendPluginResult:result callbackId:_onMessageCallback];
    } else {
        _lastChabokMessage = message;
    }
}

// called when PushClientManager Register User Successfully
- (void)pushClientManagerDidRegisterUser:(BOOL)registration{
    NSLog(@"------------ %@ %@ cid = %@",@(__PRETTY_FUNCTION__),@(registration), _onRegisterCallback);

    if (_onRegisterCallback) {
        NSDictionary *successDic = @{@"regisered":@(registration)};
        CDVPluginResult* commandResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:successDic];
        commandResult.keepCallback = @1;
        [self.commandDelegate sendPluginResult:commandResult callbackId:_onRegisterCallback];
    }
}

// called when PushClientManager Register User failed
- (void)pushClientManagerDidFailRegisterUser:(NSError *)error{
    NSLog(@"------------ %@ %@ cid = %@",@(__PRETTY_FUNCTION__),error, _onRegisterCallback);

    if (_onRegisterCallback) {
        NSDictionary *errorDic = @{@"error":error.localizedDescription};
        CDVPluginResult* commandResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:errorDic];
        [self.commandDelegate sendPluginResult:commandResult callbackId:_onRegisterCallback];
    }
}


#pragma mark - json
-(NSString *) dictionaryToJson:(NSDictionary *) dic{
    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:dic
                                                       options:NSJSONWritingPrettyPrinted
                                                         error:&error];

    if (!jsonData) {
        NSLog(@"Got an error: %@", error);
        return nil;
    }

    return [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
}

#pragma mark - private
-(void) enqueueWhenSessionIsConnected:(void(^)(void))block{
    NSString *observerKey = kPushClientDidChangeServerConnectionStateNotification;
    NSOperationQueue *queue = [NSOperationQueue mainQueue];
    __block __weak id observer = [[NSNotificationCenter defaultCenter]
                                  addObserverForName:observerKey
                                  object:nil
                                  queue:queue
                                  usingBlock:^(NSNotification * _Nonnull note) {
                                      if( PushClientManager.defaultManager.connectionState == PushClientServerConnectedState ) {
                                          [[NSNotificationCenter defaultCenter] removeObserver:observer];
                                          block();
                                      }
                                  }];
}

+(NSDictionary *) getFormattedData:(NSDictionary *)data {
    NSMutableDictionary *mutableData = [NSMutableDictionary.alloc init];
    for (NSString *key in [data allKeys]) {
        // check datetime type
        if ([key hasPrefix:@"@CHKDATE_"]) {
            NSString *actualKey = [key substringFromIndex:9];
            mutableData[actualKey] = [[Datetime alloc] initWithTimestamp:[data[key] longLongValue]];
        } else {
            mutableData[key] = data[key];
        }
    }
    return mutableData;
}

@end
