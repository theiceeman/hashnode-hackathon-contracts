//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "../interfaces/ICompound.sol";

contract CompoundController {

    function supplyErc20ToCompound(
        address _erc20,
        address _cErc20,
        uint256 _numTokensToSupply
    ) public returns (uint256) {
        // Token being supplied to compound
        Erc20 underlying = Erc20(_erc20);
        // Token sent from compound in return
        CErc20 cToken = CErc20(_cErc20);
        underlying.approve(_cErc20, _numTokensToSupply);
        uint256 mintResult = cToken.mint(_numTokensToSupply);
        return mintResult;
    }

    /*
        redeemType should equal true : if amount passed in, is in token supplied to compound
     */
    function redeemCErc20Tokens(
        uint256 amount,
        bool redeemType,
        address _cErc20
    ) public returns (bool) {
        // Create a reference to the corresponding cToken contract, like cDAI
        CErc20 cToken = CErc20(_cErc20);

        // `amount` is scaled up, see decimal table here:
        // https://compound.finance/docs#protocol-math

        uint256 redeemResult;

        if (redeemType == true) {
            // Retrieve your asset based on a cToken amount
            redeemResult = cToken.redeem(amount);
        } else {
            // Retrieve your asset based on an amount of the asset
            redeemResult = cToken.redeemUnderlying(amount);
        }

        emit MyLog("If this is not 0, there was an error", redeemResult);

        return true;
    }

}
