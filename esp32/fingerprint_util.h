#ifndef FINGERPRINT_UTIL_H
#define FINGERPRINT_UTIL_H

#include <Arduino.h>

// Bulk download function
void downloadAllTemplates(uint16_t maxTemplates, uint8_t maxRetries);

#endif
