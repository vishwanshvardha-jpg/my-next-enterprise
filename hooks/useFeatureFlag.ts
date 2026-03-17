"use client"

import { useFeatureFlagEnabled, useFeatureFlagPayload, useFeatureFlagVariantKey } from "posthog-js/react"

/**
 * A custom hook to check if a feature flag is enabled and optionally get its variant key or payload.
 * 
 * @param flagName - The name of the feature flag to check.
 * @returns An object containing the enabled status, variant key, and payload.
 */
export function useFeatureFlag(flagName: string) {
  const isEnabled = useFeatureFlagEnabled(flagName)
  const variant = useFeatureFlagVariantKey(flagName)
  const payload = useFeatureFlagPayload(flagName)

  return {
    isEnabled,
    variant,
    payload,
    // Add a loading state if needed by checking if PostHog has loaded flags
    isLoading: isEnabled === undefined,
  }
}
