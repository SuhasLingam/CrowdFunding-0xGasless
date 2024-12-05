// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Crowdfunding {
    struct Campaign {
        address creator;
        string title;
        string description;
        uint256 goal;
        uint256 deadline;
        uint256 amountRaised;
        bool claimed;
        mapping(address => uint256) contributions;
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public campaignCount;

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        string title,
        uint256 goal,
        uint256 deadline
    );
    event ContributionMade(
        uint256 indexed campaignId,
        address indexed contributor,
        uint256 amount
    );
    event FundsClaimed(uint256 indexed campaignId, uint256 amount);

    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _goal,
        uint256 _deadline
    ) external returns (uint256) {
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_goal > 0, "Goal must be greater than 0");

        uint256 campaignId = campaignCount++;
        Campaign storage campaign = campaigns[campaignId];
        campaign.creator = msg.sender;
        campaign.title = _title;
        campaign.description = _description;
        campaign.goal = _goal;
        campaign.deadline = _deadline;
        campaign.amountRaised = 0;
        campaign.claimed = false;

        emit CampaignCreated(
            campaignId,
            msg.sender,
            _title,
            _goal,
            _deadline
        );

        return campaignId;
    }

    function contribute(uint256 _campaignId) external payable {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp < campaign.deadline, "Campaign has ended");
        require(msg.value > 0, "Contribution must be greater than 0");

        campaign.contributions[msg.sender] += msg.value;
        campaign.amountRaised += msg.value;

        emit ContributionMade(_campaignId, msg.sender, msg.value);
    }

    function claimFunds(uint256 _campaignId) external {
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.sender == campaign.creator, "Only creator can claim funds");
        require(block.timestamp >= campaign.deadline, "Campaign has not ended");
        require(campaign.amountRaised >= campaign.goal, "Goal not reached");
        require(!campaign.claimed, "Funds already claimed");

        campaign.claimed = true;
        uint256 amount = campaign.amountRaised;
        payable(campaign.creator).transfer(amount);

        emit FundsClaimed(_campaignId, amount);
    }

    function getContribution(uint256 _campaignId, address _contributor)
        external
        view
        returns (uint256)
    {
        return campaigns[_campaignId].contributions[_contributor];
    }
} 