angular.module('storefrontApp')
.component('addToListButton', {
	templateUrl: 'themes/assets/js/lists/add-to-list-button.tpl.html',
	bindings: {
		selectedVariation: '<'
	},
	controller: ['customerService', 'listService', 'dialogService', function (customerService, listService, dialogService) {
		var $ctrl = this;

		$ctrl.$onInit = function () {
			compareProductInLists();
		}

		function compareProductInLists() {
			$ctrl.buttonInvalid = true;
			customerService.getCurrentCustomer().then(function (user) {
				var lists = listService.getOrCreateMyLists(user.data.userName);
				angular.forEach(lists, function (list) {
					var contains = listService.containsInList($ctrl.selectedVariation.id, list.id).contains;
					if (contains === false) {
						$ctrl.buttonInvalid = false;
					}
				})
			})
		}

		function toListsDialogDataModel(product, quantity) {
			return {
				product: product,
				quantity: quantity,
				updated: false
			}
		}

		$ctrl.addProductToWishlist = function () {
			var dialogData = toListsDialogDataModel($ctrl.selectedVariation, 1);
			dialogService.showDialog(dialogData, 'recentlyAddedListItemDialogController', 'storefront.recently-added-list-item-dialog.tpl');
		}

	}]
})
