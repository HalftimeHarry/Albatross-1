<script>
	import { createEventDispatcher } from 'svelte';
	import escrowController from '/workspace/Albatross-1/frontend/src/lib/controllers/EscrowController.js';
	import EthersProvider from '/workspace/Albatross-1/frontend/src/lib/providers/ethersProvider.js';
	import { onMount } from 'svelte';

	const ethersProvider = new EthersProvider();

	onMount(async () => {
		await escrowController.init(nftID);
	});

	const { escrow_store } = escrowController;

	$: ({ price, contributions } = $escrow_store);

	export let nftID;

	const dispatch = createEventDispatcher();

	const handleLenderActions = async (nftID) => {
		try {
			await escrowController.init(nftID);

			if (!price) {
				throw new Error('purchasePrice is undefined or null');
			}

			const approveResponse = await escrowController.approveSale(nftID);
			console.log('approveResponse:', approveResponse);

			const amountInEther = (price - contributions) / 1e18;
			console.log('amountInEther:', amountInEther);

			const lendResponse = await escrowController.buyersDepositEarnest(nftID, amountInEther);
			console.log('lendResponse:', lendResponse);

			const finalizeResponse = await escrowController.finalizeSale(nftID);
			console.log('finalizeResponse:', finalizeResponse);

			dispatch('finalize');
			window.location.reload();
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
