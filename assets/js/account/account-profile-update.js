angular.module('storefront.account')
    .component('vcAccountProfileUpdate', {
        templateUrl: "themes/assets/js/account/account-profile-update.tpl.liquid",
        bindings: {
            $router: '<'
        },
        require: {
            accountManager: '^vcAccountManager'
        },
        controller: ['storefrontApp.mainContext', '$scope', 'loadingIndicatorService', function (mainContext, $scope, loader) {
            var $ctrl = this;
            $ctrl.loader = loader;

            $scope.$watch(
                function () { return mainContext.customer; },
                function (customer) {
                    $ctrl.customer = customer;
                    if (customer) {
                        if (customer.isContract) {
                            $ctrl.$router.navigate(['Orders']);
                        }
                        $ctrl.changeData =
                            {
                                firstName: customer.firstName,
                                lastName: customer.lastName,
                                email: customer.email
                            };
                        $ctrl.phoneNumber = customer.phoneNumber;
                        $ctrl.twoFactorEnabled = customer.twoFactorEnabled;
                    }
                });

            $ctrl.submit = function () {
                // no validation
                $ctrl.accountManager.updateProfile($ctrl.changeData);
            };

            $ctrl.updatePhoneNumber = function () {
                $ctrl.accountManager
                    .updatePhoneNumber($ctrl.phoneNumber)
                    .then(function (result) {
                        if (!result.succeeded) {
                            $ctrl.phoneNumber = null;
                        }
                    });
            };

            $ctrl.deletePhoneNumber = function () {
                $ctrl.accountManager.deletePhoneNumber().then(function (result) {
                    if (result.succeeded) {
                        $ctrl.phoneNumber = null;
                    }
                });
            };

            $ctrl.changeTwoFactorAuth = function () {
                $ctrl.accountManager
                    .changeTwoFactorAuth($ctrl.twoFactorEnabled)
                    .then(function (result) {
                        if (!result.succeeded && result.verificationUrl) {
                            window.location = result.verificationUrl;
                        }
                        if (result.succeeded) {
                            $ctrl.twoFactorEnabled = !$ctrl.twoFactorEnabled;
                        }
                    });
            };
        }]
    });
