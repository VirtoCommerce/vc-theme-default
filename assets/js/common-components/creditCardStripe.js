var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcCreditCardStripe', {
    templateUrl: "themes/assets/js/common-components/creditCard.tpl.html",
    require: {
        checkoutStep: '?^vcCheckoutWizardStep'
    },
    bindings: {
        card: '=',
        validationContainer: '=',
        token: '=',
        paymentMethod: '='
    },
    controller: ['$scope', '$filter', 'stripe', function ($scope, $filter, stripe) {
        var ctrl = this;

        ctrl.createToken = function () {
            var publicKey = _.find(ctrl.paymentMethod.settings,
                function (item) {
                    return item.name === 'Stripe.Checkout.ApiPublishableKey';
                });
            stripe.setPublishableKey(publicKey.value);
            
            return stripe.card.createToken({
                number: ctrl.card.bankCardNumber,
                cvc: ctrl.card.bankCardCVV2,
                exp_month: ctrl.card.bankCardMonth,
                exp_year: ctrl.card.bankCardYear,
                name: ctrl.card.cardholderName
            }).then(function (response) {
                ctrl.token = response.id;
            });
        }

        this.$onInit = function () {
            if (ctrl.validationContainer)
                ctrl.validationContainer.addComponent(this);
            if (ctrl.checkoutStep) {
                ctrl.checkoutStep.addComponent(this);

                ctrl.checkoutStep.addStepHandler(ctrl.createToken);
            }
        };

        this.$onDestroy = function () {
            if (ctrl.validationContainer)
                ctrl.validationContainer.removeComponent(this);
            if (ctrl.checkoutStep) {
                ctrl.checkoutStep.removeComponent(this);

                ctrl.checkoutStep.removeStepHandler(ctrl.createToken);
            }
        };

        $scope.$watch('$ctrl.card.bankCardHolderName', function (val) {
            if (ctrl.card) {
                ctrl.card.bankCardHolderName = $filter('uppercase')(val);
            }
        }, true);

        ctrl.validate = function () {
            ctrl.form.$setSubmitted();
            return !ctrl.form.$invalid;
        }
    }]
});
