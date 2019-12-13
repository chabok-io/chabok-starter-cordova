/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var chabok;

var app = {
    // Application Constructor
    initialize: function() {
        console.log('=====================');
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');

        chabok = new ChabokPush();

        console.log('------------------');

        console.log('cordova.plugins = ', JSON.stringify(chabok));

        console.log('CHABOK INITIALIZED SUCCESSFULLY');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
        console.log('!!!!!!!!!!! DOM is READY !!!!!!!!!!');

        document.getElementById("btnRegister").addEventListener("click", function() {
            var userId = document.getElementById("txtUserId").value;
            if (userId !== undefined && userId != null && userId != "") {
                console.log('######### Login button clicked! #########');
                chabok.login(userId);
            }
        });

        document.getElementById("btnUnregister").addEventListener("click", function() {
            console.log('######### Logout button clicked! #########');
            chabok.logout();
        });

        document.getElementById("btnAddTag").addEventListener("click", function() {
            var tag = document.getElementById("txtTagName").value;
            if (tag !== undefined && tag != null && tag != "") {
                console.log('######### Add Tag button clicked! #########');
                chabok.addTag(tag);
            }
        });

        document.getElementById("btnRemoveTag").addEventListener("click", function() {
            var tag = document.getElementById("txtTagName").value;
            if (tag !== undefined && tag != null && tag != "") {
                console.log('######### Remove Tag button clicked! #########');
                chabok.removeTag(tag);
            }
        });

        document.getElementById("btnAddToCard").addEventListener("click", function() {
            console.log('######### AddToCart button clicked! #########');
            chabok.track('AddToCart', {id: 123, seen: true});
        });

        document.getElementById("btnPurchase").addEventListener("click", function() {
            console.log('######### Purchase button clicked! #########');
            chabok.track('Purchase', {id: 123, isRevenue: true});
        });

        document.getElementById("btnLike").addEventListener("click", function() {
            console.log('######### Like button clicked! #########');
            chabok.track('Like', {id: 123, seen: true});
        });

        document.getElementById("btnComment").addEventListener("click", function() {
            console.log('######### Comment button clicked! #########');
            chabok.track('Comment', {id: 123, liked: false});
        });

        document.getElementById("btnSetUserInfo").addEventListener("click", function() {
            console.log('######### User Info button clicked! #########');
            var _firstName = document.getElementById("txtFirstname").value;
            var _lastName = document.getElementById("txtLastname").value;
            var _gender = document.getElementById("txtGender").value;
            if (_firstName !== undefined && _firstName != null && _firstName != ""
                && _lastName !== undefined && _lastName != null && _lastName != ""
                && _gender !== undefined && _gender != null && _gender != "") {

                console.log('@@@@@@@@@@ send User Info @@@@@@@@@@');
                chabok.setUserAttributes({firstName: _firstName, lastName: _lastName, gender: _gender});
            }
        });
    }
};

app.initialize();