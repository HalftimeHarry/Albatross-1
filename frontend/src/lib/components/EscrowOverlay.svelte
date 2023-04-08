<script>
	import { onMount } from 'svelte';
	import { crossfade, fade, fly } from 'svelte/transition';
	import { isOverlayOpen } from '/workspace/Albatross-1/frontend/src/lib/providers/overlayProvider.js';
	import signersController from '/workspace/Albatross-1/frontend/src/lib/controllers/SignersController.js';
	import MetamaskController from '/workspace/Albatross-1/frontend/src/lib/controllers/MetamaskController.js';
	import { writable } from 'svelte/store';
	import FundFranchise from '/workspace/Albatross-1/frontend/src/lib/components/FundFranchise.svelte';
	import ApproveSale from '/workspace/Albatross-1/frontend/src/lib/components/ApproveSale.svelte';
	import InspectionPassed from '/workspace/Albatross-1/frontend/src/lib/components/InspectionPassed.svelte';
	import Lender from '/workspace/Albatross-1/frontend/src/lib/components/Lender.svelte';

	let activeAccount = writable(null);

	MetamaskController.store.subscribe((state) => {
		activeAccount.set(state.activeAccount);
	});

	onMount(async () => {
		await signersController.init();
	});

	const getActiveAccount = () => {
		let currentValue;
		activeAccount.subscribe((value) => (currentValue = value));
		return currentValue;
	};

	let activeAcct = getActiveAccount();

	const { signers_store } = signersController;

	$: ({ seller, lender, inspector, dao } = $signers_store);

	let open = true;
	isOverlayOpen.subscribe((value) => {
		open = value;
	});
	export let name;
	export let image;
	export let area;
	export let nftID;

	const handleClick = async () => {
		const activeAcct = getActiveAccount();

		let role;
		if (activeAcct.toLowerCase() === seller.toLowerCase()) {
			role = 'seller';
		} else if (activeAcct.toLowerCase() === inspector.toLowerCase()) {
			role = 'inspector';
		} else if (activeAcct.toLowerCase() === dao.toLowerCase()) {
			role = 'dao';
		} else {
			role = 'buyer';
		}

		if (role === 'inspector') {
			const InspectionPassed = (await import('./InspectionPassed.svelte')).default;
			new InspectionPassed({
				target: document.body,
				props: {
					nftID
				}
			});
		} else if (role !== 'buyer') {
			if (role === 'lender') {
				const Lender = (await import('./Lender.svelte')).default;
				new Lender({
					target: document.body,
					props: {
						nftID
					}
				});
			} else {
				const ApproveSale = (await import('./ApproveSale.svelte')).default;
				new ApproveSale({
					target: document.body,
					props: {
						nftID,
						role
					}
				});
			}
		} else {
			const FundFranchise = (await import('./FundFranchise.svelte')).default;
			new FundFranchise({
				target: document.body,
				props: {
					nftID
				}
			});
		}
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	transition:fade
	class:bg-gray-100={open}
	class="w-screen h-screen fixed top-0 left-0 flex justify-center items-center z-10"
	on:click={() => isOverlayOpen.set(false)}
	style="pointer-events: {open ? 'all' : 'none'}"
>
	<transition>
		{#if open}
			<div
				class="bg-gray-900 text-white rounded-md px-8 py-10 relative max-w-lg"
				in:fly={{ y: 200, duration: 2000 }}
				out:fade
				on:click|stopPropagation
			>
				<button
					class="absolute top-2 right-3 text-4xl text-gray-300 hover:-translate-y-0.5 transition-transform"
					on:click={() => isOverlayOpen.set(false)}>&times;</button
				>
				<h5>{name}</h5>
				<img src={image} alt={name} />
				<p>{area}</p>
				<button
					type="button"
					class="mt-4 text-gray-900 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 mr-2 mb-2"
					on:click={() => handleClick()}
				>
					{#if activeAcct.toLowerCase() === seller.toLowerCase()}
						<div class="mt-4 mr-3">Seller</div>
						<ApproveSale
							{nftID}
							on:close={() => isOverlayOpen.set(false)}
							on:approve={() => isOverlayOpen.set(false)}
						/>
					{:else if activeAcct.toLowerCase() === dao.toLowerCase()}
						<div class="mt-4 mr-3">DAO</div>
						<ApproveSale
							{nftID}
							on:close={() => isOverlayOpen.set(false)}
							on:approve={() => isOverlayOpen.set(false)}
						/>
					{:else if activeAcct.toLowerCase() === lender.toLowerCase()}
						<div class="mt-4 mr-3">Lender</div>
						<Lender
							{nftID}
							on:close={() => isOverlayOpen.set(false)}
							on:fund={() => isOverlayOpen.set(false)}
						/>
					{:else if activeAcct.toLowerCase() === inspector.toLowerCase()}
						<InspectionPassed
							{nftID}
							on:close={() => isOverlayOpen.set(false)}
							on:inspected={() => isOverlayOpen.set(false)}
						/>
					{:else}
						<FundFranchise
							{nftID}
							on:close={() => isOverlayOpen.set(false)}
							on:amount={() => isOverlayOpen.set(false)}
						/>
					{/if}
				</button>
			</div>
		{/if}
	</transition>
</div>
