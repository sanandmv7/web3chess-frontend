// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

contract Chess {
    uint256 public gameID;
    address public owner;

    uint256 public minWagerAmount = 0.001 ether;
    uint256 public feePercentageBPS = 200; // 2% of bet amount

    struct Game {
        address player1;
        address player2;
        address payable winner;
        uint256 amountBet;
        bool finished;
    }

    mapping(uint256 => Game) public GameInfo;
    mapping(address => uint256[]) public GamesPlayed;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor() {
        owner = msg.sender;
        gameID = 1568;
    }

    function changeOwner(address newOwner) external onlyOwner {
        owner = newOwner;
    }

    // newFeePercentage should be in BPS
    function changeFeePercentage(uint256 newFeePercentage) external onlyOwner {
        feePercentageBPS = newFeePercentage;
    }

    // newMinBetAmount should be in Wei
    function changeMinBetAmount(uint256 newMinBetAmount) external onlyOwner {
        minWagerAmount = newMinBetAmount;
    }

    function newGame() public payable {
        require(msg.value > minWagerAmount, "Invalid Bet Amount");

        uint256 feeAmount = (msg.value * feePercentageBPS) / 10000;
        payable(owner).transfer(feeAmount);

        GameInfo[gameID].player1 = msg.sender;
        GameInfo[gameID].amountBet = msg.value;
        GameInfo[gameID].finished = false;
        uint256 game = gameID;
        GamesPlayed[msg.sender].push(game);
        gameID++;
    }

    function getGameID(address player) public view returns (uint256) {
        return GamesPlayed[player][GamesPlayed[player].length - 1];
    }

    function getStake(uint256 game) public view returns (uint256) {
        return GameInfo[game].amountBet;
    }

    function joinGame(uint256 game) public payable {
        require(GameInfo[game].amountBet != 0, "Game does not exist");
        require(msg.value == GameInfo[game].amountBet, "Invalid Bet Amount");

        uint256 feeAmount = (msg.value * feePercentageBPS) / 10000;
        payable(owner).transfer(feeAmount);

        GamesPlayed[msg.sender].push(game);
        GameInfo[game].player2 = msg.sender;
    }

    function declareWinner(uint256 game, address winner) public onlyOwner {
        require(!GameInfo[game].finished);
        require(GameInfo[game].amountBet != 0, "Game does not exist");
        require(GameInfo[game].winner == address(0));
        require(msg.sender == owner);
        require(
            winner == GameInfo[game].player1 ||
                winner == GameInfo[game].player2,
            "Winner not Valid"
        );
        GameInfo[game].winner = payable(winner);
        GameInfo[game].finished = true;

        uint256 feeAmount = (GameInfo[game].amountBet * feePercentageBPS) /
            10000;

        (bool success, ) = GameInfo[game].winner.call{
            value: (2 * (GameInfo[game].amountBet - feeAmount))
        }("");
        require(success, "Failed to send");
    }

    function getGames(address user) public view returns (uint256[] memory) {
        uint256[] memory games = GamesPlayed[user];
        return games;
    }

    function getLatestGameId() public view returns (uint256) {
        return gameID;
    }

    function getGame(uint256 game) public view returns (Game memory) {
        Game memory requestedGame;
        requestedGame = GameInfo[game];
        return requestedGame;
    }
}
