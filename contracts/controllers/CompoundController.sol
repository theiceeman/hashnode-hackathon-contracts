//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/ICompound.sol";

contract CompoundController is ReentrancyGuard {
    // mapping(userAddress => tokenAddress => tokenAmount, isExists)
    mapping(address => mapping(address => UserInvestedTokenDetails))
        public UserInvestments;

    struct UserInvestedTokenDetails {
        uint256 tokenAmount;
        bool isExists;
    }

    function _setUserInvestments(
        address userAddress,
        address tokenAddress,
        uint256 tokenAmount
    ) internal {
        if (UserInvestments[userAddress][tokenAddress].isExists) {
            UserInvestments[userAddress][tokenAddress]
                .tokenAmount = tokenAmount;
        } else {
            UserInvestments[userAddress][
                tokenAddress
            ] = UserInvestedTokenDetails(tokenAmount, true);
        }
    }

    function _getUserInvestment(address userAddress, address tokenAddress)
        public
        view
        returns (UserInvestedTokenDetails memory)
    {
        if (UserInvestments[userAddress][tokenAddress].isExists) {
            return UserInvestments[userAddress][tokenAddress];
        } else {
            return UserInvestedTokenDetails(0, false);
        }
    }

    function supplyErc20ToCompound(
        address _erc20,
        address _cErc20,
        address userAddress,
        uint256 tokenAmount
    ) public returns (bool) {
        Erc20 underlying = Erc20(_erc20);
        CErc20 cToken = CErc20(_cErc20);

        UserInvestedTokenDetails memory userInvestment = _getUserInvestment(
            userAddress,
            _erc20
        );

        // Approve transfer on the ERC20 contract
        underlying.approve(_cErc20, tokenAmount);
        require(cToken.mint(tokenAmount) == 0, "compound: mint failed!");

        // Update users investment balance
        uint256 userNewBalance = userInvestment.tokenAmount + tokenAmount;
        _setUserInvestments(userAddress, _erc20, userNewBalance);
        return true;
    }

    /*
        redeemType should equal false if amount passed in, is in token supplied to compound
        // `amount` is scaled up, see decimal table here:
        // https://compound.finance/docs#protocol-math
        // underlying means token you're supplying to gain cToken
     */
    function redeemCErc20Tokens(
        uint256 amountToRedeem,
        bool redeemType,
        address _cErc20,
        address _erc20Address,
        address userAddress
    ) public returns (bool) {
        uint256 userTokenBalance = UserInvestments[userAddress][_erc20Address]
            .tokenAmount;

        // Create a reference to the corresponding cToken contract, like cDAI
        CErc20 cToken = CErc20(_cErc20);

        uint256 redeemResult;
        if (redeemType == true) {
            // Retrieve your asset based on a cToken amount
            redeemResult = cToken.redeem(amountToRedeem);
        } else {
            // Retrieve your asset based on an amount of the asset
            redeemResult = cToken.redeemUnderlying(amountToRedeem);
        }

        // After redeeming from compound to this contract, transfer redeemed token to the owners address
        Erc20 underlying = Erc20(_erc20Address);
        underlying.transfer(userAddress, amountToRedeem);

        // Update the users investment balance
        uint256 finalUserBalance = userTokenBalance - amountToRedeem;
        _setUserInvestments(userAddress, _erc20Address, finalUserBalance);

        return true;
    }

    /// @notice This will calculate the total balance of tokens invested by our whole app(this contract) in compound
    /// @dev The function was written just to understand how the balance is calculated
    /// @param _cErc20 address of token given by compound
    /// @return uint256 Amount is returned in cToken(unit)
    function estimateBalanceOfUnderlying(address _cErc20)
        public
        returns (uint256)
    {
        CErc20 cToken = CErc20(_cErc20);
        uint256 cTokenBal = cToken.balanceOf(address(this));
        uint256 exchangeRate = cToken.exchangeRateCurrent();
        uint256 decimals = 8; // WBTC = 8 decimals
        uint256 cTokenDecimals = 8;

        return
            (cTokenBal * exchangeRate) / 10**(18 + decimals - cTokenDecimals);
    }

    /// @notice This will calculate the total balance of tokens invested by our whole app(this contract) in compound
    /// @dev This will calculate the total balance of tokens invested by our whole app(this contract) in compound
    /// @param _cErc20 address of token given by compound
    /// @return uint256 Amount is returned in cToken(unit)
    function balanceOfUnderlying(address _cErc20) external returns (uint256) {
        CErc20 cToken = CErc20(_cErc20);
        return cToken.balanceOfUnderlying(address(this));
    }

    function getInfo(address cTokenAddress)
        external
        returns (uint256 exchangeRate, uint256 supplyRate)
    {
        CErc20 cToken = CErc20(cTokenAddress);
        // Amount of current exchange rate from cToken to underlying
        exchangeRate = cToken.exchangeRateCurrent();
        // Amount added to you supply balance this block
        supplyRate = cToken.supplyRatePerBlock();
        return (exchangeRate, supplyRate);
    }

    /* 
        Users will make static calls to this function, and get their interest which will now be displayed to the frontend.
     */
    function userTokenAccruedInterest(
        address cTokenAddress,
        address erc20Address,
        address userAddress
    ) external returns (uint256) {
        CErc20 cToken = CErc20(cTokenAddress);
        Erc20 underlying = Erc20(_erc20Address);
        uint256 totalAccruedInterest = cToken.balanceOfUnderlying(
            address(this)
        );
        uint256 totalErc20Invested = underlying.balanceOf(address(this));
        UserInvestedTokenDetails memory userInvestment = _getUserInvestment(
            userAddress,
            erc20Address
        );
        uint256 userPercentageInTotal = (userInvestment.tokenAmount * 100) /
            totalErc20Invested;
            return userPercentageInTotal;
        uint256 userInterest = (totalAccruedInterest / 100) *
            userPercentageInTotal;
        return userInterest;
    }
}
