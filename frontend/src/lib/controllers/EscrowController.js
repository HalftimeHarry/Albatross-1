import EthersProvider from "/workspace/Albatross-1/frontend/src/lib/providers/ethersProvider.js";
import { writable } from "svelte/store";


const baseState={
  inspector: "loading inspector address...",
  lender: "loading lender address",
  dao: "loading dao...",
  seller: "loading seller",
  deposit: "deposits ...",
  approval: false
}

class EscrowController{
  #escrowStore=writable({...baseState})
  
  constructor() {
    this.escrow_store={
      subscribe:this.#escrowStore.subscribe
    }
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
      const transactionReceipt = await this.ethersProvider?.escrowContract.buyerDepositEarnest(nftId, { amount });
      return transactionReceipt;
  }

  async getProgress() {
    const deposit = await this.ethersProvider?.escrowContract.getFundingProgress(nftID);
    this.#escrowStore.update((s) => ({ ...s, deposit }));
  }

  async approveSale(nftID) {
      const transaction = await this.ethersProvider?.escrowContract.approveSale(nftID);
      await transaction.wait();
    }
  
  async #inspectorAddress(){
    const inspector = await this.ethersProvider?.escrowContract.getInspector();
    this.#escrowStore.update(s => ({...s, inspector }))
  }

    async #lenderAddress(){
    const lender = await this.ethersProvider?.escrowContract.getLender();
    this.#escrowStore.update(s => ({...s, lender }))
  }

    async #daoAddress(){
    const dao = await this.ethersProvider?.escrowContract.getDao();
    this.#escrowStore.update(s => ({...s, dao }))
    }
  
    async #sellerAddress(){
      const seller = await this.ethersProvider?.escrowContract.getSeller();
    this.#escrowStore.update(s => ({...s, seller }))
  }

  async getApprovalStatus(nftID, address) {
    const approval = await this.ethersProvider?.escrowContract.getApprovalStatus(nftID, address);
    this.#escrowStore.update(s => ({...s, approval }))
  }

}

export default new EscrowController();
