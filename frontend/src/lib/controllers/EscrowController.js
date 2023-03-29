import EthersProvider from "/workspace/Albatross-1/frontend/src/lib/providers/ethersProvider.js";
import { writable } from "svelte/store";

const baseState = {
  inspector: "loading inspector address...",
  lender: "loading lender address",
  dao: "loading dao...",
  seller: "loading seller",
  deposit: "deposits ...",
  approval: false,
};

class EscrowController {
  #escrowStore = writable({ ...baseState });

  constructor() {
    this.escrow_store = {
      subscribe: this.#escrowStore.subscribe,
    };
  }

  async init() {
    this.ethersProvider = new EthersProvider();
    this.#inspectorAddress();
    this.#lenderAddress();
    this.#daoAddress();
    this.#sellerAddress();
    this.getProgress();
    this.approveSale();
    this.getApprovalStatus();
  }

  async buyersDepositEarnest(nftId, amount) {
    try {
      const transactionReceipt = await this.ethersProvider?.escrowContract.buyerDepositEarnest(nftId, { amount });
      if (transactionReceipt) {
        await transactionReceipt.wait();
      } else {
        console.error("Transaction is undefined.");
      }
    } catch (error) {
      console.error("Error in buyersDepositEarnest:", error);
    }
  }

  async getProgress(nftID) {
    const deposit = await this.ethersProvider?.escrowContract.getFundingProgress(nftID);
    this.#escrowStore.update((s) => ({ ...s, deposit }));
  }

  async approveSale(nftID) {
    try {
      const transaction = await this.ethersProvider?.escrowContract.approveSale(nftID);
      if (transaction) {
        await transaction.wait();
      } else {
        console.error("Transaction is undefined.");
      }
    } catch (error) {
      console.error("Error in approveSale:", error);
    }
  }

  async #inspectorAddress() {
    const inspector = await this.ethersProvider?.escrowContract.getInspector();
    this.#escrowStore.update((s) => ({ ...s, inspector }));
  }

  async #lenderAddress() {
    const lender = await this.ethersProvider?.escrowContract.getLender();
    this.#escrowStore.update((s) => ({ ...s, lender }));
  }

  async #daoAddress() {
    const dao = await this.ethersProvider?.escrowContract.getDao();
    this.#escrowStore.update((s) => ({ ...s, dao }));
  }

  async #sellerAddress() {
    const seller = await this.ethersProvider?.escrowContract.getSeller();
    this.#escrowStore.update((s) => ({ ...s, seller }));
  }

  async getApprovalStatus(nftID, address) {
    const approval = await this.ethersProvider?.escrowContract.getApprovalStatus(nftID, address);
    this.#escrowStore.update((s) => ({ ...s, approval }));
  }
}

const escrowController = new EscrowController();
const escrow_store = escrowController.escrow_store;
export default escrowController;
<<<<<<< HEAD
export { escrow_store };
=======
export { escrow_store };
>>>>>>> e6c8101 (New update added)
