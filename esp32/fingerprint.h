#ifndef FINGERPRINT_H
#define FINGERPRINT_H

#include <Arduino.h>
#include <Preferences.h>

// Declare variables
extern Preferences preferences;
extern uint16_t enrolledCount;

// Enroll and verify
uint8_t enrollFingerprint(uint16_t id);
uint8_t verifyFingerprint();
void resetEnrolmentCount();

#endif
