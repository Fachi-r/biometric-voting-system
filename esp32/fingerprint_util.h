#ifndef FINGERPRINT_UTIL_H
#define FINGERPRINT_UTIL_H

#include <Arduino.h>

// Fixed buffer size for fingerprint template
#define TEMPLATE_PAYLOAD_SIZE 512  // fingerprint template payload size
#define PACKET_HEADER_SIZE 9       // bytes before payload length (0xEF 0x01 ... packet header)
#define READ_TIMEOUT_MS 10000UL    // timeout for reading packets

static uint8_t templateBuffer[TEMPLATE_SIZE];

// Bulk download function
void downloadAllTemplates(uint16_t maxTemplates = 20, uint8_t maxRetries = 3);
bool downloadTemplateById(uint16_t id, uint8_t maxRetries = 3);  // publishes on success
uint16_t getStoredTemplateCount(uint16_t fallbackMax = 255);

#endif
