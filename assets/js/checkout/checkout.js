//Call this to register our module to main application
var moduleName = "storefront.checkout";

if (storefrontAppDependencies != undefined) {
    storefrontAppDependencies.push(moduleName);
}
angular.module(moduleName, ['credit-cards', 'angular.filter'])
    .controller('checkoutController', ['$rootScope', '$scope', '$window', 'cartService',
        function($rootScope, $scope, $window, cartService) {
            $scope.checkout = {
                wizard: {},
                paymentMethod: {},
                shipment: {},
                payment: {},
                coupons: [],
                availCountries: [],
                loading: false,
                isValid: false
            };

            $scope.validateCheckout = function(checkout) {
                checkout.isValid = checkout.payment && checkout.payment.paymentGatewayCode;
                if (checkout.isValid && !checkout.billingAddressEqualsShipping) {
                    checkout.isValid = angular.isObject(checkout.payment.billingAddress);
                }
                if (checkout.isValid && checkout.cart && checkout.cart.hasPhysicalProducts) {
                    checkout.isValid = angular.isObject(checkout.shipment)
                        && checkout.shipment.shipmentMethodCode
                        && angular.isObject(checkout.shipment.deliveryAddress);
                }
            };

            $scope.reloadCart = function() {
                return cartService.getCart().then(function(response) {
                    var cart = response.data;
                    if (!cart || !cart.id) {
                        $scope.outerRedirect($scope.baseUrl + 'cart');
                    }
                    else {
                        $scope.checkout.cart = cart;
                        $scope.checkout.coupons = cart.coupons || $scope.checkout.coupons;
                       
                        if (cart.payments.length) {
                            $scope.checkout.payment = cart.payments[0];
                            $scope.checkout.paymentMethod.code = $scope.checkout.payment.paymentGatewayCode;
                        }
                        if (cart.shipments.length) {
                            $scope.checkout.shipment = cart.shipments[0];
                        }
                        else {
                            $scope.checkout.shipment.deliveryAddress = $scope.checkout.cart.customer.addresses && $scope.checkout.cart.customer.addresses[0]
                            if (!$scope.checkout.shipment.deliveryAddress) {
                                $scope.checkout.shipment.deliveryAddress = {
                                    firstName : $scope.checkout.cart.customer.firstName,
                                    lastName : $scope.checkout.cart.customer.lastName
                                }
                            }
                        }
                        $scope.checkout.billingAddressEqualsShipping = cart.hasPhysicalProducts && (!angular.isObject($scope.checkout.payment.billingAddress) || $scope.checkout.shipment.deliveryAddress.type === 'BillingAndShipping');

                        $scope.checkout.canCartBeRecurring = $scope.customer.isRegisteredUser && _.all(cart.items, function(x) { return !x.isReccuring });

                        _.each($scope.checkout.availablePaymentPlans, function(value) {
                            value.interval = value.interval.toLowerCase();
                        });

                        $scope.checkout.paymentPlan = cart.paymentPlan && _.findWhere($scope.checkout.availablePaymentPlans, { intervalCount: cart.paymentPlan.intervalCount, interval: cart.paymentPlan.interval.toLowerCase() }) ||
                            _.findWhere($scope.checkout.availablePaymentPlans, { intervalCount: 1, interval: 'months' });
                    }
                    $scope.validateCheckout($scope.checkout);
                    return cart;
                });
            };

            $scope.validateCoupon = function (coupon) {
                coupon.processing = true;
                return cartService.validateCoupon(coupon).then(function (result) {
                    coupon.processing = false;
                   return  angular.extend(coupon, result.data);
                }, function () {
                    coupon.processing = false;
                });
            }

            $scope.applyCoupon = function(coupon) {
                coupon.processing = true;
                cartService.addCoupon(coupon.code).then(function() {
                    coupon.processing = false;
                    $scope.reloadCart();
                }, function() {
                    coupon.processing = false;
                });
            }

            $scope.removeCoupon = function(coupon) {
                coupon.processing = true;
                cartService.removeCoupon(coupon.code).then(function() {
                    coupon.processing = false;
                    $scope.checkout.coupon = {};
                    $scope.reloadCart();
                }, function() {
                    coupon.processing = false;
                });
            }

            function getAvailCountries() {
                //Load avail countries
                return cartService.getCountries().then(function(response) {
                    return response.data;
                });
            };

            $scope.getCountryRegions = function(country) {
                return cartService.getCountryRegions(country.code3).then(function(response) {
                    return response.data;
                });
            };

            $scope.getAvailShippingMethods = function(shipment) {
                return wrapLoading(function() {
                    return cartService.getAvailableShippingMethods(shipment.id).then(function(response) {
                        return response.data;
                    });
                });
            }

            $scope.getAvailPaymentMethods = function() {
                return wrapLoading(function() {
                    return cartService.getAvailablePaymentMethods().then(function(response) {
                        return response.data;
                    });
                });
            };

            $scope.selectShippingMethod = function(shippingMethod) {
                if (shippingMethod) {
                    $scope.checkout.shipment.shipmentMethodCode = shippingMethod.shipmentMethodCode;
                    $scope.checkout.shipment.shipmentMethodOption = shippingMethod.optionName;
                }
                else {
                    $scope.checkout.shipment.shipmentMethodCode = undefined;
                    $scope.checkout.shipment.shipmentMethodOption = undefined;
                }
                $scope.updateShipment($scope.checkout.shipment);
            };

            $scope.updateShipment = function(shipment) {
                return updateShipmentAndReloadCart(shipment, true);
            }

            function updateShipmentWithoutReloadCart(shipment) {
                return updateShipmentAndReloadCart(shipment, false);
            }

            function updateShipmentAndReloadCart(shipment, reloadCart) {
                if (shipment.deliveryAddress) {
                    if ($scope.checkout.billingAddressEqualsShipping) {
                        $scope.checkout.shipment.deliveryAddress.type = 'BillingAndShipping';
                    }
                    else {
                        $scope.checkout.shipment.deliveryAddress.type = 'Shipping';
                    }
                };
                //Does not pass validation errors to API
                shipment.validationErrors = undefined;
                return wrapLoading(function() {
                    if (reloadCart) {
                        return cartService.addOrUpdateShipment(shipment).then($scope.reloadCart);
                    } else {
                        return cartService.addOrUpdateShipment(shipment);
                    }
                });
            };

            $scope.createOrder = function() {
                updatePaymentWithoutReloadCart($scope.checkout.payment).then(function() {
                    updateShipmentWithoutReloadCart($scope.checkout.shipment).then(function() {
                        $scope.checkout.loading = true;
                        cartService.createOrder($scope.checkout.paymentMethod.card || []).then(function(response) {
                            var order = response.data.order;
                            var orderProcessingResult = response.data.orderProcessingResult;
                            var paymentMethod = response.data.paymentMethod;
                            handlePostPaymentResult(order, orderProcessingResult, paymentMethod);
                        });
                    });
                });
            };

            $scope.savePaymentPlan = function() {
                wrapLoading(function() {
                    return cartService.addOrUpdatePaymentPlan($scope.checkout.paymentPlan).then(function() {
                        $scope.checkout.cart.paymentPlan = $scope.checkout.paymentPlan;
                    });
                });
            };

            $scope.isRecurringChanged = function(isRecurring) {
                if ($scope.checkout.paymentPlan) {
                    if (isRecurring) {
                        $scope.savePaymentPlan();
                    } else {
                        wrapLoading(function() {
                            return cartService.removePaymentPlan().then(function() {
                                $scope.checkout.cart.paymentPlan = undefined;
                            });
                        });
                    }
                }
            };

            $scope.selectPaymentMethod = function(paymentMethod) {
                angular.extend($scope.checkout.payment, paymentMethod);
                $scope.checkout.payment.paymentGatewayCode = paymentMethod.code;
                $scope.checkout.payment.amount = angular.copy($scope.checkout.cart.total);
                $scope.checkout.payment.amount.amount += paymentMethod.totalWithTax.amount;

                updatePayment($scope.checkout.payment);
            };

            function updatePayment(payment) {
                return updatePaymentAndReloadCart(payment, true);
            }

            function updatePaymentWithoutReloadCart(payment) {
                return updatePaymentAndReloadCart(payment, false);
            }

            function updatePaymentAndReloadCart(payment, reloadCart) {
                if ($scope.checkout.billingAddressEqualsShipping) {
                    if ($scope.checkout.shipment.deliveryAddress.type === 'BillingAndShipping')
                    {
                        payment.billingAddress = angular.copy($scope.checkout.shipment.deliveryAddress);
                    }
                    else {
                        payment.billingAddress = undefined;
                    }
                }
                else if (payment.billingAddress) {
                     payment.billingAddress.type = 'Billing';
                }
                return wrapLoading(function() {
                    if (reloadCart) {
                        return cartService.addOrUpdatePayment(payment).then($scope.reloadCart);
                    } else {
                        return cartService.addOrUpdatePayment(payment);
                    }
                });
            }

            function handlePostPaymentResult(order, orderProcessingResult, paymentMethod) {
                if (!orderProcessingResult.isSuccess) {
                    $scope.checkout.loading = false;
                    $rootScope.$broadcast('storefrontError', {
                        type: 'error',
                        title: ['Error in new order processing: ', orderProcessingResult.error, 'New Payment status: ' + orderProcessingResult.newPaymentStatus].join(' '),
                        message: orderProcessingResult.error,
                    });
                    return;
                }

                if (paymentMethod.paymentMethodType && paymentMethod.paymentMethodType.toLowerCase() == 'preparedform' && orderProcessingResult.htmlForm) {
                    $scope.outerRedirect($scope.baseUrl + 'cart/checkout/paymentform?orderNumber=' + order.number);
                } else if (paymentMethod.paymentMethodType && paymentMethod.paymentMethodType.toLowerCase() == 'redirection' && orderProcessingResult.redirectUrl) {
                    $window.location.href = orderProcessingResult.redirectUrl;
                } else {
                    if (!$scope.customer.isRegisteredUser) {
                        $scope.outerRedirect($scope.baseUrl + 'cart/thanks/' + order.number);
                    } else {
                        $scope.outerRedirect($scope.baseUrl + 'account#/orders/' + order.number);
                    }
                }
            }

            function wrapLoading(func) {
                $scope.checkout.loading = true;
                return func().then(function(result) {
                    $scope.checkout.loading = false;
                    return result;
                },
                    function() {
                        $scope.checkout.loading = false;
                    });
            }

            $scope.initialize = function() {

                $scope.reloadCart().then(function(cart) {
                    $scope.checkout.wizard.goToStep(cart.hasPhysicalProducts ? 'shipping-address' : 'payment-method');
                });
            };

            getAvailCountries().then(function(countries) {
                $scope.checkout.availCountries = countries;
            });

        }]);
