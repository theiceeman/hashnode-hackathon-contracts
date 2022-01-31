//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/ICompound.sol";

contract CompoundController is ReentrancyGuard {
    // mapping(userAddress =>  (id => tokenAmount,tokenAddress, isExists) )

    mapping(address => mapping(uint256 => UserInvestedTokenDetails))
        public UserInvestments;

    // userAddress -> noOfUserInvestments
    mapping(address => uint256) public countUserInvestments;

    struct UserInvestedTokenDetails {
        uint256 tokenAmount;
        address tokenAddress;
        uint256 cTokenAmountEquiv;
        bool isExists;
    }

    function _setUserInvestments(
        address userAddress,
        address tokenAddress,
        uint256 cTokenAmountEquiv,
        uint256 tokenAmount
    ) internal {
        uint256 userInvestmentCount = countUserInvestments[userAddress];
        UserInvestments[userAddress][
            userInvestmentCount + 1
        ] = UserInvestedTokenDetails(
            tokenAmount,
            tokenAddress,
            cTokenAmountEquiv,
            true
        );
        countUserInvestments[userAddress] = userInvestmentCount + 1;
    }

    function _getUserInvestment(address userAddress, uint256 investmentId)
        public
        view
        returns (UserInvestedTokenDetails memory)
    {
        if (UserInvestments[userAddress][investmentId].isExists) {
            return UserInvestments[userAddress][investmentId];
        } else {
            return UserInvestedTokenDetails(0, address(0), 0, false);
        }
    }

    function supplyErc20ToCompound(
        address _erc20Address,
        address _cErc20Address,
        address userAddress,
        uint256 tokenAmount
    ) public returns (bool) {
        Erc20 underlying = Erc20(_erc20Address);
        CErc20 cToken = CErc20(_cErc20Address);
        // Approve transfer on the ERC20 contract
        underlying.approve(_cErc20Address, tokenAmount);
        require(cToken.mint(tokenAmount) == 0, "compound: mint failed!");

        uint256 cTokenEquiv = getCtokenEquiv(_cErc20Address, tokenAmount);

        // Create new token investment for user
        _setUserInvestments(
            userAddress,
            _erc20Address,
            cTokenEquiv,
            tokenAmount
        );
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
        address userAddress,
        uint256 investmentId
    ) public returns (bool) {
        uint256 userTokenBalance = UserInvestments[userAddress][investmentId]
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
        UserInvestments[userAddress][investmentId]
            .tokenAmount = finalUserBalance;

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
        let cTokenDecimals = 8;
        let underlying = new ethers.Contract(erc20Address, erc20Abi, ethers.provider);
        let cToken = new ethers.Contract(cTokenAddress, cTokenAbi, ethers.provider);
        let underlyingDecimals = await underlying.callStatic.decimals();
        let exchangeRateCurrent = await cToken.callStatic.exchangeRateCurrent();
        let mantissa = 18 + parseInt(underlyingDecimals) - cTokenDecimals;
        let oneCTokenInUnderlying = exchangeRateCurrent / Math.pow(10, mantissa);
        return oneCTokenInUnderlying;
    */
    function getCtokenEquiv(address cTokenAddress, uint256 tokenAmount)
        public
        returns (uint256)
    {
        uint256 cTokenDecimals = 8;
        uint256 underlyingDecimals = 18;
        CErc20 cToken = CErc20(cTokenAddress);

        uint256 currentExchangeRate = cToken.exchangeRateCurrent();
        uint256 mantissa = 18 + (underlyingDecimals - cTokenDecimals);
        uint256 oneCTokenInUnderlying = currentExchangeRate / (10**mantissa);
        return currentExchangeRate;
        return tokenAmount / oneCTokenInUnderlying;
    }

    function calcUserAccruedInterest(
        uint256 tokenAmount,
        uint256 oneCTokenInUnderlying
    ) public pure returns (uint256) {
        uint256 userAccruedInterest = tokenAmount / oneCTokenInUnderlying;
        return userAccruedInterest;
    }

    /* 
        This function will return the total cToken currently invested by this contract 
        and the total token invested by the user, so that the users interest 
        can be calclated off-chain.
     */
    /*  function getDetailsForCalcUserInterest(
        address cTokenAddress,
        address erc20Address,
        address userAddress
    )
        external
        view
        returns (uint256 userTotalInvestment, uint256 totalCtokenInvested)
    {
        CErc20 cToken = CErc20(cTokenAddress);
        totalCtokenInvested = cToken.balanceOf(address(this));
        UserInvestedTokenDetails memory userInvestment = _getUserInvestment(
            userAddress,
            erc20Address
        );
        return (userInvestment.tokenAmount, totalCtokenInvested);
    } */
}
