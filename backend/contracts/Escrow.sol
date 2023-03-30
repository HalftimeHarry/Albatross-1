// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface IERC721 {
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Escrow {
    address public nftAddress;
    address payable public seller;
    address public inspector;
    address public lender;
    address public dao;

    modifier onlyBuyer(uint256 _nftID) {
        require(msg.sender == buyer[_nftID], "Only buyer can call this method");
        _;
    }

    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this method");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "Only inspector can call this method");
        _;
    }

    mapping(uint256 => bool) public isListed;
    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => address) public buyer;
    mapping(uint256 => bool) public inspectionPassed;
    mapping(uint256 => mapping(address => bool)) public approval;
    mapping(uint256 => uint256) public goalAmount;
    mapping(uint256 => uint256) public currentDeposit;
    mapping(uint256 => mapping(address => uint256)) public buyerDeposit;

    constructor(
        address _nftAddress,
        address payable _seller,
        address _inspector,
        address _lender,
        address _dao
    ) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
        dao = _dao;
    }

    fallback() external payable {
        // handle unknown function selector
    }

    function setGoalAmount(
        uint256 _nftID,
        uint256 _goalAmount
    ) public onlySeller {
        goalAmount[_nftID] = _goalAmount;
    }

    function setSeller(address payable _seller) public onlySeller {
        seller = _seller;
    }

    function setInspector(address _inspector) public onlySeller {
        inspector = _inspector;
    }

    function setLender(address _lender) public onlySeller {
        lender = _lender;
    }

    function setDao(address _dao) public onlySeller {
        dao = _dao;
    }

    function list(
        uint256 _nftID,
        address _buyer,
        uint256 _purchasePrice,
        uint256 _goalAmount
    ) public payable {
        // Transfer NFT from seller to this contract
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);

        isListed[_nftID] = true;
        purchasePrice[_nftID] = _purchasePrice;
        goalAmount[_nftID] = _goalAmount;
        buyer[_nftID] = _buyer;
    }

    // Put Under Contract (only buyer - payable escrow)
    function depositEarnest(uint256 _nftID) public payable {
        // Set goal amount to 5
        uint256 goal = 9000000000000000000;
        goalAmount[_nftID] = goal;

        require(
            currentDeposit[_nftID] < goalAmount[_nftID],
            "Goal amount already reached"
        );

        uint256 remaining = goalAmount[_nftID] - currentDeposit[_nftID];
        uint256 contribution;

        if (msg.value > remaining) {
            contribution = remaining;
            uint256 refund = msg.value - remaining;
            payable(msg.sender).transfer(refund);
        } else {
            contribution = msg.value;
        }

        currentDeposit[_nftID] += contribution;
        buyerDeposit[_nftID][msg.sender] += contribution;
    }

    // Update Inspection Status (only inspector)
    function updateInspectionStatus(
        uint256 _nftID,
        bool _passed
    ) public onlyInspector {
        inspectionPassed[_nftID] = _passed;
    }

    // Approve Sale
    function approveSale(uint256 _nftID) public {
        approval[_nftID][msg.sender] = true;
    }

    // Finalize Sale
    // -> Require inspection status (add more items here, like appraisal)
    // -> Require sale to be authorized
    // -> Require funds to be correct amount
    // -> Transfer NFT to DAO
    // -> Transfer Funds to seller
    // -> Create NFT that represents what is at stake for the buyer
    // -> Return exessFunds to buyer when goalAmount is achieved 
    function finalizeSale(uint256 _nftID) public {
        require(inspectionPassed[_nftID]);
        require(approval[_nftID][buyer[_nftID]]);
        require(approval[_nftID][seller]);
        require(approval[_nftID][lender]);
        require(approval[_nftID][dao]);

        uint256 excessFunds = address(this).balance - purchasePrice[_nftID];

        isListed[_nftID] = false;

        (bool success, ) = payable(seller).call{value: purchasePrice[_nftID]}(
            ""
        );
        require(success);

        if (excessFunds > 0) {
            (success, ) = payable(buyer[_nftID]).call{value: excessFunds}("");
            require(success);
        }

        IERC721(nftAddress).transferFrom(address(this), dao, _nftID);

        // TODO: Create NFT that represents what is at stake for the buyer
    }

    // Cancel Sale (handle earnest deposit)
    // -> if inspection status is not approved, then refund, otherwise send to seller
    function cancelSale(uint256 _nftID) public {
        if (inspectionPassed[_nftID] == false) {
            payable(buyer[_nftID]).transfer(address(this).balance);
        } else {
            payable(seller).transfer(address(this).balance);
        }
    }

    receive() external payable {}

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
