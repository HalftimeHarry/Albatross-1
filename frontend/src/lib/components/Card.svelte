<script>
	import { fade } from 'svelte/transition';
	import { isOverlayOpen } from '/workspace/Albatross-1/frontend/src/lib/providers/overlayProvider.js';
	import EscrowOverlay from '/workspace/Albatross-1/frontend/src/lib/components/EscrowOverlay.svelte';
	import ProgressBar from '/workspace/Albatross-1/frontend/src/lib/components/ProgressBar.svelte';
	import { fundingProgress } from '/workspace/Albatross-1/frontend/src/lib/providers/progressBarProvider.js';
	import { onMount } from 'svelte';
	import EthersProvider from '/workspace/Albatross-1/frontend/src/lib/providers/ethersProvider.js';
	import EscrowController, {
		escrow_store
	} from '/workspace/Albatross-1/frontend/src/lib/controllers/EscrowController.js';
	import { ethers } from 'ethers';

	export let name;
	export let image;
	export let area;
	export let nftID;

	let deposit = 0;
	const ethersProvider = new EthersProvider();

	let nftArray = [];

	const usdPerEther = 2000; // the current USD price of 1 ether

	async function getProgress(nftID) {
		const progress = await ethersProvider?.escrowContract.getFundingProgress(nftID);
		const deposit = parseFloat(ethers.utils.formatEther(progress));
		const deposit_usd = deposit * usdPerEther;
		// display deposit in USD with 2 decimal places console.log(deposit_usd.toFixed(2));

		const contributions = await ethersProvider?.escrowContract.getContributions(nftID);
		const total = parseFloat(ethers.utils.formatEther(contributions)) * ethToUsdRate;

		const isListed = await ethersProvider?.escrowContract.getIsListed(nftID);

		const getGoal = await ethersProvider?.escrowContract.getGoalAmount(nftID);
		const goal = parseFloat(ethers.utils.formatEther(getGoal)) * usdPerEther;

		const getPrice = await ethersProvider?.escrowContract.getPurchasePrice(nftID);
		const price = parseFloat(ethers.utils.formatEther(getPrice)) * ethToUsdRate;

		const purchase_price = price - total;

		const getDeadline = await ethersProvider?.escrowContract.getDeadLine(nftID);
		const deadline = new Date(getDeadline.toNumber() * 1000);

		const currentTime = new Date();
		const countdown = Math.floor((deadline - currentTime) / 1000);

		// find the NFT in the array and update its values
		const index = nftArray.findIndex((nft) => nft.id === nftID);
		nftArray[index].deposit = total;
		nftArray[index].goal = goal - deposit;
		nftArray[index].deadline = deadline;
		nftArray[index].countdown = countdown;
		nftArray[index].isListed = isListed;
		nftArray[index].price = price;
		nftArray[index].purchase_price = purchase_price;

		escrow_store.update((s) => ({ ...s, deposit }));
		console.log(nftArray);
	}

	let ethToUsdRate;

	onMount(async () => {
		const response = await fetch(
			'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
		);
		const data = await response.json();
		ethToUsdRate = data.ethereum.usd;

		const goal = await ethersProvider?.escrowContract.getGoalAmount(nftID);
		nftArray.push({
			id: nftID,
			deposit: 0,
			goal: parseFloat(ethers.utils.formatEther(goal)) * usdPerEther
		});

		await getProgress(nftID);
	});
	fundingProgress.subscribe((s) => {
		deposit = s;
	});
</script>

<div
	class="max-w-sm bg-white border border-blue-700 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700"
>
	<div class="mt-2 text-center font-sans text-cyan-800 font-bold">
		{#each nftArray as nft}
			<div>Currently ${nft.deposit} USD funded</div>
			<ProgressBar progress={(nft.deposit / nft.goal) * 100} />
			Our Goal is ${nft.goal}<br />
			Purchase Price ${nft.purchase_price.toFixed(2)} USD<br />
			{nft.isListed ? 'Please contribute' : 'Awsome! we reached our Goal!!!'}<br />
			<p>
				{nft.countdown > 0
					? `${Math.floor(nft.countdown / 86400)} days, ${Math.floor(
							(nft.countdown % 86400) / 3600
					  )} hours left to contribute!`
					: 'Deadline has passed.'}
			</p>
		{/each}
	</div>
	<img class="rounded-t-lg" src={image} alt={name} />
	<div class="p-5">
		<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
			{name}
		</h5>
		<p class="mb-3 font-normal text-gray-700 dark:text-gray-400">
			{area}
		</p>
		<!-- svelte-ignore a11y-invalid-attribute -->
		<a
			transition:fade
			href="#"
			class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
			on:click={() => {
				isOverlayOpen.set(true);
				let SignersController = new EscrowOverlay({
					target: document.body,
					props: {
						name: name,
						image: image,
						area: area,
						nftID: nftID
					}
				});
			}}
		>
			Next
			<svg
				aria-hidden="true"
				class="w-4 h-4 ml-2 -mr-1"
				fill="currentColor"
				viewBox="0 0 20 20"
				xmlns="http://www.w3.org/2000/svg"
				><path
					fill-rule="evenodd"
					d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
					clip-rule="evenodd"
				/></svg
			>
		</a>
	</div>
</div>
