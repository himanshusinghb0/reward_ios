//
//  HealthKitBridge.swift
//  App
//
//  Full iOS HealthKit SDK Integration for Capacitor
//  Tracks user footsteps using native iOS HealthKit framework
//

import Foundation
import Capacitor
import HealthKit

/// Native HealthKit Bridge for Capacitor
/// Provides full step tracking functionality using iOS HealthKit SDK
@objc(HealthKitBridge)
public class HealthKitBridge: NSObject {
    
    /// Shared HealthKit store instance
    private static let healthStore = HKHealthStore()
    
    /// Check if HealthKit is available on this device
    /// Uses HKHealthStore.isHealthDataAvailable()
    @objc public static func isAvailable(_ call: CAPPluginCall) {
        let available = HKHealthStore.isHealthDataAvailable()
        call.resolve([
            "available": available
        ])
    }
    
    /// Request HealthKit authorization from user
    /// Requests read permission for step count data
    @objc public static func requestAuthorization(_ call: CAPPluginCall) {
        // Get read types from JavaScript
        guard let readTypes = call.getArray("read", String.self) else {
            call.reject("Invalid read types parameter")
            return
        }
        
        // Build set of HealthKit types to request
        var readSet: Set<HKObjectType> = []
        
        // Request step count permission if "steps" is in readTypes
        if readTypes.contains("steps") {
            if let stepType = HKObjectType.quantityType(forIdentifier: .stepCount) {
                readSet.insert(stepType)
            }
        }
        
        // Request authorization from HealthKit
        healthStore.requestAuthorization(toShare: nil, read: readSet) { success, error in
            DispatchQueue.main.async {
                if let error = error {
                    // Authorization failed
                    call.reject(error.localizedDescription)
                } else {
                    // Authorization completed (success indicates user granted)
                    call.resolve([
                        "granted": success
                    ])
                }
            }
        }
    }
    
    /// Query step count for a date range
    /// Uses HKStatisticsQuery to get cumulative step count
    @objc public static func querySteps(_ call: CAPPluginCall) {
        // Get date range from JavaScript (ISO 8601 format)
        guard let startDateString = call.getString("startDate"),
              let endDateString = call.getString("endDate"),
              let startDate = ISO8601DateFormatter().date(from: startDateString),
              let endDate = ISO8601DateFormatter().date(from: endDateString),
              let stepType = HKQuantityType.quantityType(forIdentifier: .stepCount) else {
            call.reject("Invalid parameters: startDate and endDate required in ISO 8601 format")
            return
        }
        
        // Create predicate for date range
        let predicate = HKQuery.predicateForSamples(
            withStart: startDate,
            end: endDate,
            options: .strictStartDate
        )
        
        // Create statistics query to sum all step samples in date range
        let query = HKStatisticsQuery(
            quantityType: stepType,
            quantitySamplePredicate: predicate,
            options: .cumulativeSum
        ) { _, result, error in
            DispatchQueue.main.async {
                if let error = error {
                    // Query failed
                    call.reject("Failed to query steps: \(error.localizedDescription)")
                } else {
                    // Extract step count from result
                    let steps = Int(
                        result?.sumQuantity()?.doubleValue(for: HKUnit.count()) ?? 0
                    )
                    
                    // Return steps to JavaScript
                    call.resolve([
                        "steps": steps
                    ])
                }
            }
        }
        
        // Execute the query
        healthStore.execute(query)
    }
}


