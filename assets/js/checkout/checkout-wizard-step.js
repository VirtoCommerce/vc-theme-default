var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcCheckoutWizardStep', {
    templateUrl: "themes/assets/js/checkout/checkout-wizard-step.tpl.html",
    transclude: true,
    require: {
        wizard: '^vcCheckoutWizard'
    },
    bindings: {
        name: '@',
        title: '@',
        stepDisabled: '=?',
        onNextStep: '&?',
        canEnter: '=?',
        final: '<?'
    },
    controller: [function () {
        var ctrl = this;
        ctrl.components = [];
        ctrl.stepHandlers = [];
        ctrl.canEnter = true;

        this.$onInit = function () {
            ctrl.wizard.addStep(this);
            
            if (ctrl.onNextStep && angular.isFunction(ctrl.onNextStep))
                ctrl.stepHandlers.push(ctrl.onNextStep);
        };

        ctrl.addStepHandler = function (handler) {
            ctrl.stepHandlers.push(handler);
        }

        ctrl.removeStepHandler = function (handler) {
            ctrl.stepHandlers = _.without(ctrl.stepHandlers, handler);
        }

        ctrl.addComponent = function (component) {
            ctrl.components.push(component);
        };
        ctrl.removeComponent = function (component) {
            ctrl.components = _.without(ctrl.components, component);
        };
        ctrl.validate = function () {
            return _.every(ctrl.components, function (x) { return typeof x.validate !== "function" || x.validate(); });
        }
    }]
});
