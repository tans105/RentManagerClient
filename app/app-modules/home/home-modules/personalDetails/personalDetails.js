'use strict';


appModule.controller('PersonalDetailsCtrl', function ($scope, $state, $cookies, Notification, personalDetailsService, cfpLoadingBar, $log) {
    var cookieData = $cookies.getObject('cookieData');
    if (cookieData) {
        $scope.activateModule("personalDetails");
        $scope.roleId = cookieData.roleId;
        var personalDetails = null;

        //Callback for profile fetch

        var profileFetchSuccess = function (response) {
            cfpLoadingBar.complete();
            $log.warn("<--PROFILE FETCH RESPONSE-->");
            $log.info(response);
            if (response.data.success) {
                personalDetailsService.parseToNumeric(response.data);

                $scope.formSchema = response.data.formSchema;
                personalDetails = response.data.personalDetails;

                angular.forEach($scope.formSchema, function (row) {
                    angular.forEach(row.stack, function (stack) {
                        if(stack.fieldId=='idproof'){
                            stack.selectList=response.data.idProofMst;
                        }
                        if(stack.fieldId=='state'){
                            stack.selectList=response.data.stateMst;
                        }
                        for (var key in personalDetails) {
                            if (key == stack.fieldId) {
                                stack.value = personalDetails[key];
                            }
                        }
                    });
                });

            }
            else {
                Notification.error({
                    message: 'Failed to load profile, Login again!',
                    positionY: 'top',
                    positionX: 'left'
                });
            }
        }

        //Callback for profile update
        var profileStoreSuccess = function (response) {
            $log.warn("<--PROFILE STORE RESPONSE-->");
            if (angular.isDefined(response) && response.status == 200) {
                if (response.data.success) {
                    Notification.success({message: response.data.responseMsg, positionY: 'top', positionX: 'left'});
                    $log.info(response);
                }
                else {
                    Notification.error({message: response.data.responseMsg, positionY: 'top', positionX: 'left'});
                    $log.info(response);
                }

            } else {
                Notification.error({
                    message: 'Profile Update Failed, Contact Admin!',
                    positionY: 'top',
                    positionX: 'left'
                });
                $log.info(response);
            }
        }

        $scope.storeInfo = function () {
            angular.forEach($scope.formSchema, function (row) {
                angular.forEach(row.stack, function (stack) {
                    for (var key in personalDetails) {
                        if (key == stack.fieldId) {
                            personalDetails[key] = stack.value;
                        }
                    }
                })
            });
            cfpLoadingBar.start();
            personalDetailsService.storeProfile(cookieData.token, personalDetails, profileStoreSuccess);
        }


        cfpLoadingBar.start();
        personalDetailsService.fetchProfile(cookieData.token, profileFetchSuccess);
    }

});

