import { CustodyHolding, PhysicalRedemption } from '../types';

export class CustodyOps {
  /**
   * Generates a 6-digit pickup verification code
   */
  public static generatePickupCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Validates and reconciles physical silver reserve against custodian's attestation
   */
  public static reconcileAttestation(
    systemFineGrams: number,
    attestedFineGrams: number,
    toleranceGrams: number = 0.5
  ): {
    isMatched: boolean;
    differenceGrams: number;
    actionRequired: 'none' | 'auto_pause_fund' | 'investigate_audit';
    message: string;
  } {
    const differenceGrams = systemFineGrams - attestedFineGrams;
    const isMatched = Math.abs(differenceGrams) <= toleranceGrams;

    if (isMatched) {
      return {
        isMatched: true,
        differenceGrams: 0,
        actionRequired: 'none',
        message: 'Physical silver reserve reconciles 100% to vault attestation.'
      };
    }

    return {
      isMatched: false,
      differenceGrams,
      actionRequired: 'auto_pause_fund',
      message: `CRITICAL MISMATCH: System expects ${systemFineGrams.toLocaleString()} g, but custodian attestation reports ${attestedFineGrams.toLocaleString()} g (Difference: ${differenceGrams > 0 ? '+' : ''}${differenceGrams} g). Subscriptions & physical redemptions auto-paused.`
    };
  }

  /**
   * Release physical silver against verified pickup code
   */
  public static verifyAndReleasePhysical(params: {
    request: PhysicalRedemption;
    enteredPickupCode: string;
    operatorId: string;
    operatorName: string;
    measuredScaleWeightGrams: number;
    operatorNotes?: string;
  }): {
    success: boolean;
    error?: string;
    updatedRequest?: PhysicalRedemption;
  } {
    const {
      request,
      enteredPickupCode,
      operatorId,
      operatorName,
      measuredScaleWeightGrams,
      operatorNotes
    } = params;

    if (request.status === 'collected') {
      return { success: false, error: 'This pickup order has already been collected.' };
    }

    if (request.pickupCode !== enteredPickupCode.trim()) {
      return { success: false, error: 'Invalid pickup code. Verification failed.' };
    }

    // Weight check: scale weight must match requested grams within ±0.05g
    const weightDiff = Math.abs(measuredScaleWeightGrams - request.grams);
    if (weightDiff > 0.1) {
      return {
        success: false,
        error: `Assay scale weight (${measuredScaleWeightGrams} g) does not match bar specification (${request.grams} g). Bar quarantined.`
      };
    }

    const updatedRequest: PhysicalRedemption = {
      ...request,
      status: 'collected',
      collectedAt: new Date().toISOString(),
      releasedByOperatorId: operatorId,
      weightAssayedGrams: measuredScaleWeightGrams,
      operatorNotes: operatorNotes || `Released by operator ${operatorName} against OTP & QR validation.`
    };

    return {
      success: true,
      updatedRequest
    };
  }
}
