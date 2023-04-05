<script>
	import { writable } from 'svelte/store';
	import escrowController from '/workspace/Albatross-1/frontend/src/lib/controllers/EscrowController.js';
	import { createEventDispatcher } from 'svelte';

	export let nftID;

	export const approve = writable(true);

	const dispatch = createEventDispatcher();

	const approveSale = async (nftID) => {
		const response = await escrowController.approveSale(nftID);
		console.log(response);
		return response;
	};

	export { approveSale };

	const handleClick = async (event) => {
		event.preventDefault();
		approveSale(nftID).then(() => {
			dispatch('approve');
			window.location.reload(); // Refreshes the page
		});
	};
</script>

<button
	type="submit"
	class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4"
	on:click={handleClick}
>
	Approve Sale
</button>
