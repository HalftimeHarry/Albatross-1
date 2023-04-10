import EthersProvider from "/workspace/Albatross-1/frontend/src/lib/providers/ethersProvider.js";
import { writable } from "svelte/store";

const baseState = {
  inspector: "loading inspector address...",
  lender: "loading lender address",
  dao: "loading dao...",
  seller: "loading seller",
  deposit: "deposits ...",
  contributions: "USD",
  price: "USD",
  goal: "Goal Amount ...",
  deadline: "Deadline ...",
  isListed: false,
  approval: false,
  inspectionStatus: null,
};

class EscrowController {
  #escrowStore = writable({ ...baseState });

  constructor() {
    this.escrow_store = {
      subscribe: this.#escrowStore.subscribe,
    };
  }

  async init(nftID) {
    this.ethersProvider = new EthersProvider();
    this.#inspectorAddress();
    this.#lenderAddress();
    this.#daoAddress();
    this.#sellerAddress();
    this.getPurchasePrice(nftID);
    this.getContributions(nftID);
    this.getGoalAmount();
    this.getDeadLine();
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

  async finalizeSale(nftID) {
    const tx = await this.ethersProvider?.escrowContract.finalizeSale(nftID);
    const transactionReceipt = await tx.wait();
    return transactionReceipt;
  }


  async getProgress(nftID) {
    const deposit = await this.ethersProvider?.escrowContract.getFundingProgress(nftID);
    this.#escrowStore.update((s) => ({ ...s, deposit }));
  }

  async getGoalAmount(nftID) {
    const goal = await this.ethersProvider?.escrowContract.getGoalAmount(nftID);
    this.#escrowStore.update((s) => ({ ...s, goal }));
  }

  async getDeadLine(nftID) {
    const deadline = await this.ethersProvider?.escrowContract.getDeadLine(nftID);
    this.#escrowStore.update((s) => ({ ...s, deadline }));
  }

  async getInspectionStatus(nftID) {
    const inspectionStatus = await this.ethersProvider?.escrowContract.getInspectionStatus(nftID);
    this.#escrowStore.update((s) => ({ ...s, inspectionStatus }));
  }

  /**
   * @param {any} nftID
   * @param {any} status
   */
  async updateInspectionStatus(nftID, status) {
    try {
      const transaction = await this.ethersProvider?.escrowContract.updateInspectionStatus(nftID, status);
      if (transaction) {
        await transaction.wait();
        return true; // Return a value to indicate success
      } else {
        console.error("Transaction is undefined. Check contract instance and parameters.");
        return false;
      }
    } catch (error) {
      console.error("Error in updateInspectionStatus:", error);
      return false;
    }
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

  async getIsListed(nftID) {
    const isListed = await this.ethersProvider?.escrowContract.getIsListed(nftID);
    this.#escrowStore.update((s) => ({ ...s, isListed }));
  }

  async getPurchasePrice(nftID) {
    const price = await this.ethersProvider?.escrowContract.getPurchasePrice(nftID);
    this.#escrowStore.update((s) => ({ ...s, price }));
  }

  async getContributions(nftID) {
    const contributions = await this.ethersProvider?.escrowContract.getContributions(nftID);
    this.#escrowStore.update((s) => ({ ...s, contributions }));
  }
}

const escrowController = new EscrowController();
const escrow_store = escrowController.escrow_store;
export default escrowController;
export { escrow_store };
