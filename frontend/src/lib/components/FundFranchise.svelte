<script>
	import { writable } from 'svelte/store';
	import escrowController from '/workspace/Albatross-1/frontend/src/lib/controllers/EscrowController.js';
	import { createEventDispatcher } from 'svelte';

	export let nftID;

	export const amount = writable(null);
	const dispatch = createEventDispatcher();

	const usdValue = writable(null);
	const conversionRate = 2000; // 1 ETH = 2000 USD

	$: if ($amount !== null) {
		usdValue.set($amount * conversionRate);
	}

	const buyersDepositEarnest = async (nftID, amount) => {
		const ethValue = Number(amount) / 1e18;
		const formattedAmount = ethValue.toFixed(18);
		const response = await escrowController.buyersDepositEarnest(nftID, {
			amount: formattedAmount
		});
		console.log(response);
		return response;
	};

	export { buyersDepositEarnest };

	const handleSubmit = async (event) => {
		event.preventDefault();
		const response = await escrowController.buyersDepositEarnest(nftID, $amount);
		buyersDepositEarnest(nftID, $amount).then(() => {
			dispatch('amount');
			window.location.reload(); // Refreshes the page
		});
	};
</script>

<form on:submit={handleSubmit}>
	<label class="block text-sm font-medium text-gray-700 mb-2"> Enter Amount in ETH </label>
	<input
		type="number"
		step="any"
		name="amount"
		id="amount"
		class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-black text-white"
		placeholder="Enter amount in ETH"
		bind:value={$amount}
		required
	/>

	{#if $usdValue !== null}
		<p class="mt-2">Equivalent in USD: ${$usdValue.toFixed(2)}</p>
	{/if}

	<button
		type="submit"
		class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4"
	>
		Fund Franchise
	</button>
</form>
