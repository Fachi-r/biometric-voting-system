
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Loader2, CheckCircle, XCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BiometricLoginProps {
  onLogin: (biometricData: any) => Promise<boolean>;
}

const BiometricLogin: React.FC<BiometricLoginProps> = ({ onLogin }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const [message, setMessage] = useState('');

  const handleBiometricScan = async (isAdmin: boolean = false) => {
    setIsScanning(true);
    setScanResult(null);
    setMessage('Scanning fingerprint...');

    try {
      // Simulate biometric scanning process
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Verifying identity...');
      
      const success = await onLogin({ isAdmin });
      
      if (success) {
        setScanResult('success');
        setMessage('Authentication successful!');
        
        // Reset after showing success
        setTimeout(() => {
          setScanResult(null);
          setMessage('');
        }, 2000);
      } else {
        setScanResult('error');
        setMessage('Authentication failed. Please try again.');
      }
    } catch (error) {
      setScanResult('error');
      setMessage('Biometric scan failed. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const FingerprintIcon = () => (
    <motion.div
      animate={isScanning ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 1, repeat: isScanning ? Infinity : 0 }}
      className="relative"
    >
      <Fingerprint className="h-24 w-24 text-blue-600" />
      {isScanning && (
        <motion.div
          className="absolute inset-0 border-4 border-blue-300 rounded-full"
          animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 p-3 rounded-full">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              Secure Login
            </CardTitle>
            <CardDescription className="text-slate-600">
              Use your fingerprint to access the voting system
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Biometric Scanner */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <FingerprintIcon />
                  {scanResult === 'success' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2"
                    >
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </motion.div>
                  )}
                  {scanResult === 'error' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2"
                    >
                      <XCircle className="h-8 w-8 text-red-500" />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Status Message */}
              {message && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-sm font-medium mb-4 ${
                    scanResult === 'success' 
                      ? 'text-green-600' 
                      : scanResult === 'error' 
                      ? 'text-red-600' 
                      : 'text-slate-600'
                  }`}
                >
                  {message}
                </motion.p>
              )}

              {/* Login Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => handleBiometricScan(false)}
                  disabled={isScanning}
                  className="w-full h-12 text-lg font-medium bg-blue-600 hover:bg-blue-700"
                  aria-label="Login with fingerprint as voter"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="mr-2 h-5 w-5" />
                      Login as Voter
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => handleBiometricScan(true)}
                  disabled={isScanning}
                  variant="outline"
                  className="w-full h-12 text-lg font-medium border-amber-200 text-amber-700 hover:bg-amber-50"
                  aria-label="Login with fingerprint as administrator"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-5 w-5" />
                      Login as Admin
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-medium text-slate-900 mb-2">Security Information</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Your biometric data is processed locally</li>
                <li>• No fingerprint data is stored on our servers</li>
                <li>• All votes are encrypted and stored on blockchain</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default BiometricLogin;
