package com.chabokpush.cordova;

import android.content.Context;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;

import com.adpdigital.push.AdpPushClient;
import com.adpdigital.push.AppState;
import com.adpdigital.push.Callback;
import com.adpdigital.push.ChabokEvent;
import com.adpdigital.push.ChabokNotification;
import com.adpdigital.push.ChabokNotificationAction;
import com.adpdigital.push.ConnectionStatus;
import com.adpdigital.push.Datetime;
import com.adpdigital.push.NotificationHandler;
import com.adpdigital.push.config.Environment;
import com.adpdigital.push.LogLevel;
import com.adpdigital.push.PushMessage;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * This class echoes a string called from JavaScript.
 */
public class ChabokPush extends CordovaPlugin {
    private static final String TAG = "CHK";

    private String lastConnectionStatues;
    private JSONObject lastChabokMessage;
    private CallbackContext onMessageCallbackContext;
    private CallbackContext onRegisterCallbackContext;
    private CallbackContext onNotificationOpenedContext;
    private CallbackContext onConnectionStatusCallbackContext;

    private boolean setNotificationOpenedHandler = false;

    public static ChabokNotification coldStartChabokNotification;
    public static ChabokNotificationAction coldStartChabokNotificationAction;
    private String lastMessageId;

    @Override
    protected void pluginInitialize() {
        final Context context = this.cordova.getActivity().getApplicationContext();
        final ChabokPush that = this;
        this.cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                Log.d(TAG, "Starting Chabok plugin");
                AdpPushClient.setApplicationContext(context);
                AdpPushClient.get().addListener(that);

                AdpPushClient.get().addNotificationHandler(new NotificationHandler(){
                    @Override
                    public boolean notificationOpened(ChabokNotification message, ChabokNotificationAction notificationAction) {
                        coldStartChabokNotification = message;
                        coldStartChabokNotificationAction = notificationAction;

                        handleNotificationOpened();

                        return super.notificationOpened(message, notificationAction);
                    }
                });
            }
        });
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        android.util.Log.d(TAG, "----------- execute: action = " + action + " , args = " + args);

        if (action.equals("configureEnvironment")) {
            boolean devMode = args.getBoolean(0);
            configureEnvironment(devMode, callbackContext);
            return true;
        } else if (action.equals("login")) {
            String userId = args.getString(0);
            login(userId, callbackContext);
            return true;
        } else if (action.equals("getUserId")){
            getUserId(callbackContext);
            return true;
        } else if (action.equals("getInstallation")){
            getInstallation(callbackContext);
            return true;
        } else if (action.equals("setDefaultTracker")){
            String defaultTracker = args.getString(0);
            setDefaultTracker(defaultTracker);
            return true;
        } else if (action.equals("resetBadge")){
            resetBadge();
            return true;
        } else if (action.equals("appWillOpenUrl")){
            String url = args.getString(0);

            appWillOpenUrl(url);
            return true;
        } else if (action.equals("logout")) {
            logout();
            return true;
        } else if (action.equals("addTag")){
            String tagName = args.getString(0);

            addTag(tagName, callbackContext);
            return true;
        } else if (action.equals("removeTag")){
            String tagName = args.getString(0);

            removeTag(tagName, callbackContext);
            return true;
        } else if (action.equals("setUserAttributes")) {
            JSONObject userInfo = args.getJSONObject(0);

            setUserAttributes(userInfo);
            return true;
        } else if (action.equals("unsetUserAttribute")) {
            String attributeKey = args.getString(0);

            unsetUserAttribute(attributeKey);
            return true;
        } else if (action.equals("incrementUserAttribute")) {
            String attributeKey = args.getString(0);
            double attributeValue = args.getDouble(1);

            incrementUserAttribute(attributeKey, attributeValue);
            return true;
        } else if (action.equals("decrementUserAttribute")) {
            String attributeKey = args.getString(0);
            double attributeValue = args.getDouble(1);

            decrementUserAttribute(attributeKey, attributeValue);
            return true;
        } else if (action.equals("track")){
            String trackName = args.getString(0);
            JSONObject data = args.getJSONObject(1);

            track(trackName, data);
            return true;
        } else if (action.equals("trackPurchase")) {
            String trackName = args.getString(0);
            JSONObject data = args.getJSONObject(1);

            trackPurchase(trackName, data);
            return true;
        } else if (action.equals("setOnMessageCallback")){
            this.setOnMessageCallbackContext(callbackContext);

            if (callbackContext != null && this.lastChabokMessage != null){
                successCallback(callbackContext, this.lastChabokMessage);
            }
            return true;
        } else if (action.equals("setOnConnectionStatusCallback")){
            this.setOnConnectionStatusCallbackContext(callbackContext);

            if (callbackContext != null && this.lastConnectionStatues != null){
                successCallback(callbackContext, this.lastConnectionStatues);
            }
            return true;
        } else if (action.equals("setOnNotificationOpenedCallback")){
            this.setOnNotificationOpenedContext(callbackContext);

            coldStartChabokNotification = AdpPushClient.get().getLastNotificationData();
            coldStartChabokNotificationAction = AdpPushClient.get().getLastNotificationAction();

            if (callbackContext != null && coldStartChabokNotification != null){
                handleNotificationOpened();
            }
            return true;
        }
        return false;
    }

    public void configureEnvironment(boolean devMode, CallbackContext callbackContext) {
        AdpPushClient.setApplicationContext(getApplicationContext());
        AdpPushClient.configureEnvironment(devMode ? Environment.SANDBOX : Environment.PRODUCTION);
        AdpPushClient.setLogLevel(LogLevel.VERBOSE);

        AdpPushClient chabok = AdpPushClient.get();
        if (chabok != null) {
            android.util.Log.d(TAG, "init: Initilized sucessfully");
            callbackContext.success("Initilized sucessfully");
        } else {
            android.util.Log.d(TAG, "Could not init chabok parameters");
            callbackContext.error("Could not init chabok parameters");
            return;
        }

        chabok.addListener(this);
    }

    public void login(String userId, CallbackContext callbackContext) {
        this.onRegisterCallbackContext = callbackContext;
        AdpPushClient.get().login(userId);
    }

    public void logout() {
        AdpPushClient.get().logout();
    }

    public void publish(JSONObject message, CallbackContext callbackContext) {
        try {
            JSONObject dataMap = null;
            if (message.has("data")) {
                dataMap = message.getJSONObject("data");
            }
            String body = message.getString("content");
            String userId = message.getString("userId");
            String channel = message.getString("channel");

            PushMessage msg = new PushMessage();

            if (body != null) {
                msg.setBody(body);
            }
            if (userId != null) {
                msg.setUser(userId);
            }
            if (userId != null) {
                msg.setUser(userId);
            }
            if (channel != null) {
                msg.setChannel(channel);
            }

            if (dataMap != null) {
                msg.setData(dataMap);
            }

            AdpPushClient.get().publish(msg, new Callback() {
                @Override
                public void onSuccess(Object o) {
                    callbackContext.success("Message published");
                }

                @Override
                public void onFailure(Throwable throwable) {
                    callbackContext.error(throwable.getMessage());
                }
            });
        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.error(e.getMessage());
        }
    }

    public void track(String trackName, JSONObject data){
        try {
            if (data != null) {
                JSONObject modifiedEvents = new JSONObject();
                Iterator<String> keys = data.keys();
                while (keys.hasNext()) {
                    String key = keys.next();
                    if (key.startsWith("@CHKDATE_")) {
                        String actualKey = key.substring(9);
                        if (data.get(key) instanceof String) {
                            modifiedEvents.put(actualKey, new Datetime(Long.valueOf(data.getString(key))));
                        }
                    } else {
                        modifiedEvents.put(key, data.get(key));
                    }
                }
                AdpPushClient.get().track(trackName, modifiedEvents);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    public void trackPurchase(String eventName, JSONObject data) {
        try {
            double revenue = 0;
            String currency = null;
            JSONObject eventData = null;
            if (!data.has("revenue")) {
                throw new IllegalArgumentException("Invalid revenue");
            }
            revenue = data.getDouble("revenue");
            if (data.has("currency")) {
                currency = data.getString("currency");
            }

            if (data.has("data")) {
                eventData = data.getJSONObject("data");
            }

            ChabokEvent chabokEvent = new ChabokEvent(revenue);
            if (currency != null) {
                chabokEvent.setRevenue(revenue, currency);
            }

            if (eventData != null) {
                JSONObject modifiedEvents = new JSONObject();
                Iterator<String> keys = eventData.keys();
                while (keys.hasNext()) {
                    String key = keys.next();
                    if (key.startsWith("@CHKDATE_")) {
                        String actualKey = key.substring(9);
                        if (eventData.get(key) instanceof String) {
                            modifiedEvents.put(actualKey, new Datetime(Long.valueOf(eventData.getString(key))));
                        }
                    } else {
                        modifiedEvents.put(key, eventData.get(key));
                    }
                }
                chabokEvent.setData(modifiedEvents);
            }

            AdpPushClient.get().trackPurchase(eventName, chabokEvent);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    public void addTag(String tagName, CallbackContext callbackContext){
        AdpPushClient.get().addTag(tagName, new Callback() {
            @Override
            public void onSuccess(Object o) {
                android.util.Log.d(TAG, "The addTags onSuccess: called");
                callbackContext.success("Tag Added");
            }

            @Override
            public void onFailure(Throwable throwable) {
                android.util.Log.d(TAG, "The addTag onFailure: called");
                callbackContext.error(throwable.getMessage());
            }
        });
    }

    public void removeTag(String tagName, CallbackContext callbackContext){
        AdpPushClient.get().removeTag(tagName, new Callback() {
            @Override
            public void onSuccess(Object o) {
                android.util.Log.d(TAG, "The removeTag onSuccess: called");
                callbackContext.success("Tag removed");
            }

            @Override
            public void onFailure(Throwable throwable) {
                android.util.Log.d(TAG, "The removeTag onFailure: called");
                callbackContext.error(throwable.getMessage());
            }
        });
    }

    public void setDefaultTracker(String defaultTracker){
        AdpPushClient.get().setDefaultTracker(defaultTracker);
    }

    public void appWillOpenUrl(String link) {
        if (link == null) {
            return;
        }

        Uri uri = Uri.parse(link);
        AdpPushClient.get().appWillOpenUrl(uri);
    }

    public void setUserAttributes(JSONObject userInfo) {
        if (userInfo != null) {
            HashMap<String, Object> userInfoMap = null;
            try {
                userInfoMap = (HashMap<String, Object>) jsonToMap(userInfo);
                HashMap<String, Object> modifiedInfo = new HashMap<>();
                for (Map.Entry<String, Object> entry : userInfoMap.entrySet()) {
                    if (entry.getKey().startsWith("@CHKDATE_")) {
                        String actualKey = entry.getKey().substring(9);
                        if (entry.getValue() instanceof String) {
                            modifiedInfo.put(actualKey, new Datetime(Long.valueOf((String) entry.getValue())));
                        }
                    } else {
                        modifiedInfo.put(entry.getKey(), entry.getValue());
                    }
                }
                AdpPushClient.get().setUserAttributes(modifiedInfo);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
    }

    public void unsetUserAttribute(String attributeKey) {
        AdpPushClient.get().unsetUserAttribute(attributeKey);
    }

    public void incrementUserAttribute(String attributeKey, double attributeValue) {
        AdpPushClient.get().incrementUserAttribute(attributeKey, attributeValue);
    }

    public void decrementUserAttribute(String attributeKey, double attributeValue) {
        AdpPushClient.get().incrementUserAttribute(attributeKey, -attributeValue);
    }

    public String getUserId(CallbackContext callbackContext){
        String userId = AdpPushClient.get().getUserId();

        if (callbackContext != null){
            if (userId != null){
                callbackContext.success(userId);
            } else {
                callbackContext.error("The userId is null, You didn't register yet!");
            }
        }

        return userId;
    }

    public String getInstallation(CallbackContext callbackContext){
        String installationId = AdpPushClient.get().getUserId();

        if (callbackContext != null){
            if (installationId != null){
                callbackContext.success(installationId);
            } else {
                callbackContext.error("The installationId is null, You didn't register yet!");
            }
        }

        return installationId;
    }

    public void resetBadge(){
        AdpPushClient.get().resetBadge();
    }

    public void setOnMessageCallbackContext(CallbackContext callbackContext){
        this.onMessageCallbackContext = callbackContext;
    }

    public void setOnConnectionStatusCallbackContext(CallbackContext callbackContext){
        this.onConnectionStatusCallbackContext = callbackContext;
    }

    private void setOnNotificationOpenedContext(CallbackContext callbackContext) {
        this.onNotificationOpenedContext = callbackContext;
    }

    private void handleNotificationOpened() {
        if (coldStartChabokNotificationAction != null &&
                coldStartChabokNotification != null &&
                (lastMessageId == null || !lastMessageId.contentEquals(coldStartChabokNotification.getId()))) {
            lastMessageId = coldStartChabokNotification.getId();

            notificationOpenedEvent(coldStartChabokNotification, coldStartChabokNotificationAction);

            coldStartChabokNotification = null;
            coldStartChabokNotificationAction = null;
        }
    }

    private void notificationOpenedEvent(ChabokNotification message, ChabokNotificationAction notificationAction) {
        final CallbackContext callbackContext = this.onNotificationOpenedContext;

        final JSONObject response = new JSONObject();

        try {
            if (notificationAction.actionID != null) {
                response.put("actionId", notificationAction.actionID);
            }
            if (notificationAction.actionUrl != null) {
                response.put("actionUrl", notificationAction.actionUrl);
            }

            if (notificationAction.type == ChabokNotificationAction.ActionType.Opened) {
                response.put("actionType", "opened");
            } else if (notificationAction.type == ChabokNotificationAction.ActionType.Dismissed) {
                response.put("actionType", "dismissed");
            } else if (notificationAction.type == ChabokNotificationAction.ActionType.ActionTaken) {
                response.put("actionType", "action_taken");
            }

            JSONObject msgMap = new JSONObject();

            if (message.getTitle() != null) {
                msgMap.put("title", message.getTitle());
            }
            if (message.getId() != null) {
                msgMap.put("id", message.getId());
            }

            if (message.getText() != null) {
                msgMap.put("body", message.getText());
            }
            if (message.getTrackId() != null) {
                msgMap.put("trackId", message.getTrackId());
            }
            if (message.getTopicName() != null) {
                msgMap.put("channel", message.getTopicName());
            }

            if (message.getSound() != null) {
                msgMap.put("sound", message.getSound());
            }

            try {
                Bundle data = message.getExtras();
                if (data != null) {
                    msgMap.put("data", data);
                }
            } catch (JSONException e) {
                e.printStackTrace();
            }

            response.put("message", msgMap);

            if (coldStartChabokNotification == null) {
                coldStartChabokNotification = message;
            }
            if (coldStartChabokNotificationAction == null) {
                coldStartChabokNotificationAction = notificationAction;
            }

            if (response != null && callbackContext != null) {
                successCallback(callbackContext, response);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    public void onEvent(AppState state){
        android.util.Log.d(TAG, "=================== onEvent: state = " + state + ", this.onRegisterCallbackContext = " + this.onRegisterCallbackContext);
        if (state == AppState.REGISTERED){
            if ( this.onRegisterCallbackContext == null){
                return;
            }

            try {
                JSONObject successData = new JSONObject();
                successData.put("registered", true);

                PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, successData);
                this.onRegisterCallbackContext.sendPluginResult(pluginResult);
            } catch (JSONException e) {
                e.printStackTrace();
            }

        }
    }

    public void onEvent(final ConnectionStatus status) {
        String connectionStatus = null;

        switch (status) {
            case CONNECTED:
                android.util.Log.d(TAG, "Connected to the chabok");
                connectionStatus = "CONNECTED";
                break;
            case CONNECTING:
                android.util.Log.d(TAG, "Connecting to the chabok");
                connectionStatus = "CONNECTING";
                break;
            case DISCONNECTED:
                android.util.Log.d(TAG, "Disconnected");
                connectionStatus = "DISCONNECTED";
                break;
            case NOT_INITIALIZED:
                android.util.Log.d(TAG, "NOT_INITIALIZED");
                connectionStatus = "NOT_INITIALIZED";
                break;
            case SOCKET_TIMEOUT:
                android.util.Log.d(TAG, "SOCKET_TIMEOUT");
                connectionStatus = "SOCKET_TIMEOUT";
                break;
            default:
                android.util.Log.d(TAG, "Disconnected");
                connectionStatus = "DISCONNECTED";
        }

        this.lastConnectionStatues = connectionStatus;

        if (connectionStatus != null && this.onConnectionStatusCallbackContext != null){
            successCallback(this.onConnectionStatusCallbackContext, connectionStatus);
        }
    }

    public void onEvent(final PushMessage msg) {
        final CallbackContext callbackContext = this.onMessageCallbackContext;

        this.cordova.getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                JSONObject message = new JSONObject();

                try {
                    message.put("id", msg.getId());
                    message.put("body", msg.getBody());
                    message.put("sound", msg.getSound());
                    message.put("sentId", msg.getSentId());
                    message.put("channel", msg.getChannel());
                    message.put("senderId", msg.getSenderId());
                    message.put("expireAt", msg.getExpireAt());
                    message.put("alertText", msg.getAlertText());
                    message.put("createdAt", msg.getCreatedAt());
                    message.put("alertTitle", msg.getAlertTitle());
                    message.put("intentType", msg.getIntentType());
                    message.put("receivedAt", msg.getReceivedAt());

                    if (msg.getData() != null) {
                        message.put("data", msg.getData());
                    }

                    if (msg.getNotification() != null) {
                        message.put("notification", msg.getNotification());
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }

                lastChabokMessage = message ;

                if (message != null && callbackContext != null) {
                    successCallback(callbackContext, message);
                }
            }
        });
    }

    public void successCallback(CallbackContext callbackContext, String message){
        PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, message);
        pluginResult.setKeepCallback(true);
        callbackContext.sendPluginResult(pluginResult);
    }

    public void successCallback(CallbackContext callbackContext, JSONObject data){
        PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, data);
        pluginResult.setKeepCallback(true);
        callbackContext.sendPluginResult(pluginResult);
    }

    public void failureCallback(CallbackContext callbackContext, String message){
        PluginResult pluginResult = new PluginResult(PluginResult.Status.ERROR, message);
        pluginResult.setKeepCallback(true);
        callbackContext.sendPluginResult(pluginResult);
    }

    public void failureCallback(CallbackContext callbackContext, JSONObject data){
        PluginResult pluginResult = new PluginResult(PluginResult.Status.ERROR, data);
        pluginResult.setKeepCallback(true);
        callbackContext.sendPluginResult(pluginResult);
    }

    /**
     * Gets the application context from cordova's main activity.
     *
     * @return the application context
     */
    private Context getApplicationContext() {
        return this.cordova.getActivity().getApplicationContext();
    }

    public static Map<String, Object> jsonToMap(JSONObject json) throws JSONException {
        Map<String, Object> retMap = new HashMap<String, Object>();

        if(json != JSONObject.NULL) {
            retMap = toMap(json);
        }
        return retMap;
    }

    public static Map<String, Object> toMap(JSONObject object) throws JSONException {
        Map<String, Object> map = new HashMap<String, Object>();

        Iterator<String> keysItr = object.keys();
        while(keysItr.hasNext()) {
            String key = keysItr.next();
            Object value = object.get(key);

            if(value instanceof JSONArray) {
                value = toList((JSONArray) value);
            }

            else if(value instanceof JSONObject) {
                value = toMap((JSONObject) value);
            }
            map.put(key, value);
        }
        return map;
    }

    public static List<Object> toList(JSONArray array) throws JSONException {
        List<Object> list = new ArrayList<Object>();
        for(int i = 0; i < array.length(); i++) {
            Object value = array.get(i);
            if(value instanceof JSONArray) {
                value = toList((JSONArray) value);
            }

            else if(value instanceof JSONObject) {
                value = toMap((JSONObject) value);
            }
            list.add(value);
        }
        return list;
    }
}
