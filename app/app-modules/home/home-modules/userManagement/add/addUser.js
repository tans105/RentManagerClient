/**
 * Created by tanmay on 6/6/17.
 */
'use strict';

appModule.controller('AddUserCtrl', function ($rootScope, $scope, $state, UserManagementService, $cookies, Notification, $parse, $log) {
    var cookieData = $cookies.getObject('cookieData');
    if (cookieData) {
        $scope.roleId = cookieData.roleId;
        var statePlaceholder = "Select Native State";
        var idproofPlaceholder = "Select Id proof";
        var personalDetails = null;


        console.log("controller reporting");
        var templateFetchSuccess = function (response) {
            $rootScope.loading = false;
            $log.warn("<--NEW USER TEMPLATE FETCH RESPONSE-->");
            $log.info(response);
            if (response.data.success) {
                UserManagementService.parseToNumeric(response.data);

                $scope.formSchema = response.data.formSchema;
                personalDetails = response.data.personalDetails;
                $scope.roleMst = response.data.roleMst;
                $scope.selectedRole = $scope.roleMst[0].code;

                angular.forEach($scope.formSchema, function (row) {
                    angular.forEach(row.stack, function (stack) {
                        if (stack.fieldId == 'idproof') {
                            stack.selectList = response.data.idProofMst;
                        }
                        if (stack.fieldId == 'state') {
                            stack.selectList = response.data.stateMst;
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
        $rootScope.loading = true;
        UserManagementService.fetchTemplate(cookieData.token, templateFetchSuccess);


        var userAddSuccess = function (response) {
            $rootScope.loading = false;
            $log.warn("<--NEW USER STORE-->");
            $log.info(response);
            if (response.data.success) {
                Notification.success({
                    message: 'User ' + response.data.userId + ' created successfully',
                    positionY: 'top',
                    positionX: 'left'
                });
            }
            else {
                Notification.error({
                    message: response.data.responseMsg,
                    positionY: 'top',
                    positionX: 'left'
                });
            }
        }

        $scope.addUser = function () {
            angular.forEach($scope.formSchema, function (row) {
                angular.forEach(row.stack, function (stack) {
                    for (var key in personalDetails) {
                        if (stack.value == statePlaceholder) {
                            stack.value = null;
                        }
                        if (stack.value == idproofPlaceholder) {
                            stack.value = null;
                        }
                        if (key == stack.fieldId) {
                            personalDetails[key] = stack.value;
                        }
                    }
                })
            });

            $rootScope.loading = true;
            UserManagementService.addUser(cookieData.token, personalDetails, $scope.selectedRole, userAddSuccess);
        }
    }
});