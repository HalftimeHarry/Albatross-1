import { ProgressBarProvider } from '/workspace/Albatross-1/frontend/src/lib/providers/progressBarProvider.js';
import { writable } from 'svelte/store';
import ethersProvider from '/workspace/Albatross-1/frontend/src/lib/providers/ethersProvider.js';

const baseState = {
  fundingProgress: 0,
};

class ProgressBarController {
  #progressBarManagerStore = writable({ ...baseState });

  constructor() {
    this.pro_store = {
      subscribe: this.#progressBarManagerStore.subscribe,
    };
    this.ethersProvider = new ethersProvider();
  }

  async init() {
    this.progressBarProvider = new ProgressBarProvider();
    this.#getProgress();
  }

  async #getProgress() {
    const fundingProgress = await this.ethersProvider.escrowContract.getFundingProgress(nftID);
    this.#progressBarManagerStore.update((s) => ({ ...s, fundingProgress }));
  }
}

export default new ProgressBarController();
