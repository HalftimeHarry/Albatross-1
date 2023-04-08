<script>
	import { createEventDispatcher } from 'svelte';
	import escrowController from '/workspace/Albatross-1/frontend/src/lib/controllers/EscrowController.js';
	import { ethers } from 'ethers';

	export let nftID;

	const dispatch = createEventDispatcher();

	const handleLenderActions = async (nftID) => {
		try {
			await escrowController.init(nftID);

			// Call approveSale function
			const approveResponse = await escrowController.approveSale(nftID);
			console.log('approveSale response:', approveResponse);

			// Call getPurchasePrice function
			const purchasePrice = await escrowController.getPurchasePrice(nftID);
			console.log('getPurchasePrice response:', purchasePrice);

			if (!purchasePrice) {
				throw new Error('purchasePrice is undefined or null');
			}

			// Call lenderFund function
			const weiAmount = ethers.utils.parseUnits(purchasePrice.toString(), 'ether');
			const fundResponse = await escrowController.lenderFund(nftID, weiAmount);
			console.log('lenderFund response:', fundResponse);

			// Call finalizeSale function
			const finalizeResponse = await escrowController.finalizeSale(nftID);
			console.log('finalizeSale response:', finalizeResponse);

			dispatch('actionCompleted');
			window.location.reload(); // Refreshes the page
		} catch (error) {
			console.error('Error in handleLenderActions:', error);
		}
	};
</script>

<button
	type="submit"
	class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4"
	on:click={() => handleLenderActions(nftID)}
>
	Approve, Fund & Finalize Sale
</button>
