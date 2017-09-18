var storefrontApp = angular.module('storefrontApp');

storefrontApp.service('dialogService', ['$uibModal', function ($uibModal) {
    return {
        showDialog: function (dialogData, controller, templateUrl) {
            var modalInstance = $uibModal.open({
                controller: controller,
                templateUrl: templateUrl,
                resolve: {
                    dialogData: function () {
                        return dialogData;
                    }
                }
            });
        }
    }
}]);

storefrontApp.service('feedbackService', ['$http', function ($http) {
    return {
        postFeedback: function (data) {
            return $http.post('storefrontapi/feedback', { model: data });
        }
    }
}]);

storefrontApp.service('customerService', ['$http', function ($http) {
    return {
        getCurrentCustomer: function () {
            return $http.get('storefrontapi/account?t=' + new Date().getTime());
        }
    }
}]);

storefrontApp.service('marketingService', ['$http', function ($http) {
    return {
        getDynamicContent: function (placeName) {
            return $http.get('storefrontapi/marketing/dynamiccontent/' + placeName + '?t=' + new Date().getTime());
        },
    }
}]);

storefrontApp.service('pricingService', ['$http', function ($http) {
	return {
		getActualProductPrices: function (products) {
		    return $http.post('storefrontapi/pricing/actualprices', { products: products });
		}
	}
}]);

storefrontApp.service('catalogService', ['$http', function ($http) {
    return {
        getProduct: function (productIds) {
            return $http.get('storefrontapi/products?productIds=' + productIds + '&t=' + new Date().getTime());
        },
        search: function (criteria) {
            return $http.post('storefrontapi/catalog/search', { searchCriteria: criteria });
        },
        searchCategories: function (criteria) {
            return $http.post('storefrontapi/categories/search', { searchCriteria: criteria });
        }
    }
}]);

storefrontApp.service('cartService', ['$http', function ($http) {
    return {
        getCart: function () {
            return $http.get('storefrontapi/cart?t=' + new Date().getTime());
        },
        getCartItemsCount: function () {
            return $http.get('storefrontapi/cart/itemscount?t=' + new Date().getTime());
        },
        addLineItem: function (productId, quantity) {
            return $http.post('storefrontapi/cart/items', { id: productId, quantity: quantity });
        },
        changeLineItemQuantity: function (lineItemId, quantity) {
            return $http.put('storefrontapi/cart/items', { lineItemId: lineItemId, quantity: quantity });
        },
        removeLineItem: function (lineItemId) {
            return $http.delete('storefrontapi/cart/items?lineItemId=' + lineItemId);
        },
        changeLineItemPrice: function (lineItemId, newPrice) {
        	return $http.put('storefrontapi/cart/items/price', { lineItemId: lineItemId, newPrice: newPrice});
        },
        clearCart: function () {
            return $http.post('storefrontapi/cart/clear');
        },
        getCountries: function () {
            return $http.get('storefrontapi/countries?t=' + new Date().getTime());
        },
        getCountryRegions: function (countryCode) {
        	return $http.get('storefrontapi/countries/' + countryCode + '/regions?t=' + new Date().getTime());
        },
        addCoupon: function (couponCode) {
            return $http.post('storefrontapi/cart/coupons/' + couponCode);
        },
        removeCoupon: function () {
            return $http.delete('storefrontapi/cart/coupons');
        },
        addOrUpdateShipment: function (shipment) {
            return $http.post('storefrontapi/cart/shipments', shipment);
        },
        addOrUpdatePayment: function (payment) {
            return $http.post('storefrontapi/cart/payments', payment );
        },
        getAvailableShippingMethods: function (shipmentId) {
            return $http.get('storefrontapi/cart/shipments/' + shipmentId + '/shippingmethods?t=' + new Date().getTime());
        },
        getAvailablePaymentMethods: function () {
            return $http.get('storefrontapi/cart/paymentmethods?t=' + new Date().getTime());
        },
        addOrUpdatePaymentPlan: function (plan) {
            return $http.post('storefrontapi/cart/paymentPlan', plan);
        },
        removePaymentPlan: function () {
            return $http.delete('storefrontapi/cart/paymentPlan');
        },
        createOrder: function (bankCardInfo) {
            return $http.post('storefrontapi/cart/createorder', { bankCardInfo: bankCardInfo });
        }
    }
}]);

storefrontApp.service('listService', ['$http', '$localStorage', 'customerService', function ($http, $localStorage, customerService) {
    return {
        getAllLists: function (userName) {
            return $localStorage['lists'][userName];
        },
        getSharedLists: function (userName) {
            var lists = $localStorage['lists'];
            var sharedLists = [];
            _.each($localStorage['sharedListsIds'][userName], function (cartId) {
                _.each(lists, function (list) {
                        if (angular.isDefined(_.find(list, { id: cartId.toString() }))) {
                            _.memoize(sharedLists.push(_.find(list, { id: cartId })));
                            //$localStorage['lists'][userName].push(result);
                        }
                      
                    })
            })
            sharedLists = _.map(_.groupBy(sharedLists, function (item) {
                return item.name;
            }), function (grouped) {
                if (grouped.length > 1)
                    if (!_.isEqual(grouped[0], grouped[1])) {
                        return [grouped[0], grouped[1]];
                    }
                return grouped[0];
            });

            return sharedLists;
        },
        getWishlist: function (listName, permission, id, userName) {
            if (!_.contains($localStorage['lists'][userName], _.find($localStorage['lists'][userName], { name: listName })) && angular.isDefined(userName)) {
                $localStorage['lists'][userName].push({ name: listName, permission: permission, id: id, items:[], author: userName });
            }

            return _.find($localStorage['lists'][userName], { name: listName });
            //return $http.get('storefrontapi/lists/' + listName + '?t=' + new Date().getTime());
        },

        addItemToList: function (listId, product) {
            console.log(2);
            _.each($localStorage['lists'], function (list) {
                if (angular.isDefined(_.find(list, { id: listId }))) {
                    var searchedList = _.find(list, { id: listId });
                    searchedList.items.push(product);
                    console.log($localStorage['lists'], '3');
                }

            })
        },
        putAddedItemToSharedList: function (listName, userName) {
            var lists = angular.copy($localStorage['lists']);
            _.each(lists, function (list) {
                if (angular.isDefined(_.find(list, { id: cartId }))) {
                    var result = _.find(list, { id: cartId });
                    result.friendList = true;
                    $localStorage['lists'][userName].push(result);
                }
            })
        },
        containsInList: function (productId, cartId) {
            var lists = angular.copy($localStorage['lists']);
            var contains;
            _.each(lists, function (list) {
                if (angular.isDefined(_.find(list, { id: cartId }))) {
                    var currentList = _.find(list, { id: cartId });
                    if (angular.isDefined(_.find(currentList.items, { productId: productId })))
                        contains = true;
                    else
                        contains = false;
                }
            })
            return { contains: contains };
        },
        contains: function (productId, listName) {
            return $http.get('storefrontapi/lists/' + listName + '/items/' + productId + '/contains?t=' + new Date().getTime());
        },
        addLineItem: function (productId, listName) {
            return $http.post('storefrontapi/lists/' + listName + '/items', { productId: productId });
        },

        removeLineItem: function (lineItemId, listName) {
            return $http.delete('storefrontapi/lists/' + listName + '/items/' + lineItemId);
        },
        clearList: function (cartId, userName) {
            $localStorage['lists'][userName] = _.filter($localStorage['lists'][userName], function (x) { return x.id != cartId});
            console.log(_.filter($localStorage['lists'][userName], function (x) { return x.id != cartId }));
            //return $http.post('storefrontapi/lists/clear', { listName: listName });
        },
        removeFromFriendsLists: function (currentId, userName) {
            $localStorage['sharedListsIds'][userName] = _.filter($localStorage['sharedListsIds'][userName], function (cartId) {
                return cartId !== currentId;
            })
        }
    }
}]);

storefrontApp.service('quoteRequestService', ['$http', function ($http) {
    return {
        getCurrentQuoteRequest: function () {
            return $http.get('storefrontapi/quoterequest/current?t=' + new Date().getTime());
        },
        getQuoteRequest: function (number) {
            return $http.get('storefrontapi/quoterequests/' + number + '?t=' + new Date().getTime());
        },
        getQuoteRequestItemsCount: function (number) {
            return $http.get('storefrontapi/quoterequests/' + number + '/itemscount?t=' + new Date().getTime());
        },
        addProductToQuoteRequest: function (productId, quantity) {
            return $http.post('storefrontapi/quoterequests/current/items', { productId: productId, quantity: quantity });
        },
        removeProductFromQuoteRequest: function (quoteRequestNumber, quoteItemId) {
            return $http.delete('storefrontapi/quoterequests/' + quoteRequestNumber + '/items/' + quoteItemId);
        },
        submitQuoteRequest: function (quoteRequestNumber, quoteRequest) {
            return $http.post('storefrontapi/quoterequests/' + quoteRequestNumber + '/submit', { quoteForm: quoteRequest });
        },
        rejectQuoteRequest: function (quoteRequestNumber) {
            return $http.post('storefrontapi/quoterequests/' + quoteRequestNumber + '/reject');
        },
        updateQuoteRequest: function (quoteRequestNumber, quoteRequest) {
            return $http.put('storefrontapi/quoterequests/' + quoteRequestNumber + '/update', { quoteRequest: quoteRequest });
        },
        getTotals: function (quoteRequestNumber, quoteRequest) {
            return $http.post('storefrontapi/quoterequests/' + quoteRequestNumber + '/totals', { quoteRequest: quoteRequest });
        },
        confirmQuoteRequest: function (quoteRequestNumber, quoteRequest) {
            return $http.post('storefrontapi/quoterequests/' + quoteRequestNumber + '/confirm', { quoteRequest: quoteRequest });
        }
    }
}]);

storefrontApp.service('recommendationService', ['$http', function ($http) {
    return {
        getRecommendedProducts: function (requestData) {
            return $http.post('storefrontapi/recommendations', requestData );
        }
    }
}]);

storefrontApp.service('orderService', ['$http', function ($http) {
    return {
        getOrder: function (orderNumber) {
            return $http.get('storefrontapi/orders/' + orderNumber + '?t=' + new Date().getTime());
        }
    }
}]);
