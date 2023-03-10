<script>
	import { crossfade, fade, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import Card from '/workspace/Albatross-1/frontend/src/lib/components/Card.svelte';
	import EthersProvider from '/workspace/Albatross-1/frontend/src/ethersProvider.js';
	import escrowController from '/workspace/Albatross-1/frontend/src/lib/controllers/EscrowController.js';
	import franchiseController from '/workspace/Albatross-1/frontend/src/lib/controllers/FranchiseController.js';
	import { onMount } from 'svelte';

	onMount(async () => {
		await escrowController.init();
		await franchiseController.init();
	});

	const { escrow_store } = escrowController;
	const { franchise_store } = franchiseController;

	$: ({ eadd } = $escrow_store);
	$: ({ nfts } = $franchise_store);

	const ethersProvider = new EthersProvider();
	let nfts = [];

	async function getNfts() {
		const nfts = await ethersProvider.getNFTs();
		nfts.sort((a, b) => a.id - b.id);
		nfts.slice(12); // Skip the first 12 items
		nfts.filter((nft) => nft.name && nft.image && nft.area && nft.id);
		nfts.forEach((nft) => nfts.push(nft));
	}

	const transitionConfig = (node, { delay = 0, duration = 400, easing = null }) => {
		return {
			delay,
			duration,
			easing,
			css: (t, u) => {
				u = u === 'height' ? 'px' : u;
				return `${t}: calc(${t === 'opacity' ? '' : '-1 *'} var(--${t})${u})`;
			}
		};
	};

	const transition = (node, opts) => crossfade(transitionConfig(node, opts));
</script>

<section class="container mx-auto ml-auto">
	<h1
		class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-blue-500 md:text-5xl lg:text-6xl dark:text-white"
		in:fly={{ y: 200, duration: 2000 }}
		out:fade
	>
		{eadd}
	</h1>
	<p
		class="mb-6 text-lg font-normal text-white lg:text-xl sm:px-16 xl:px-48"
		in:fly={{ y: 200, duration: 2000 }}
		out:fade
	>
		Fix
	</p>

	{#if nfts}
		<div class="grid gap-2 md:grid-cols-3" in:fly={{ y: 200, duration: 2000 }} out:fade>
			{#each nfts as nft}
				{#if nft.name && nft.image && nft.area && nft.id}
					<Card name={nft.name} image={nft.image} area={nft.area} />
				{/if}
			{/each}
		</div>
	{:else}
		<p>Loading...</p>
	{/if}
</section>
