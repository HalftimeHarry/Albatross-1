<script>
	import { writable } from 'svelte/store';
	import escrowController from '/workspace/Albatross-1/frontend/src/lib/controllers/EscrowController.js';
	import { createEventDispatcher } from 'svelte';

	export let nftID;

	export const inspected = writable(true);

	const dispatch = createEventDispatcher();

	const inspectedSale = async (nftID) => {
		console.log(nftID);
		try {
			const response = await escrowController.updateInspectionStatus(nftID, true);
			console.log(response);
			return response;
		} catch (error) {
			console.error('Error in inspectedSale:', error);
		}
	};

	export { inspectedSale };

	const handleClick = async (event) => {
		event.preventDefault();
		inspectedSale(nftID).then(() => {
			dispatch('inspected');
		});
	};
</script>

<button
	type="submit"
	class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4"
	on:click={handleClick}
>
	Inspected
</button>
