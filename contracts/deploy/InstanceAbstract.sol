// SPDX-License-Identifier: CC0-1.0
pragma solidity >=0.6.0 <0.8.0;

/**
 * @title InstanceAbstract
 * @author Ricardo Guilherme Schmidt (Status Research & Development GmbH) 
 * @dev Defines instance common storage
 *      Important to avoid overwriting wrong storage pointers is that 
 *      InstanceAbstract should be always the first contract at heritance.
 */
abstract contract InstanceAbstract {    
    // protected zone start (InstanceAbstract vars)
    InstanceAbstract public base;
    // protected zone end
    constructor() { }
}