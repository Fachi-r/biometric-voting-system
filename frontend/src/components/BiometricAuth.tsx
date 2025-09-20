import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store';
import { closeBiometricAuth } from '@/store/slices/modalSlice';
import { Fingerprint, Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const BiometricAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { biometricAuth } = useSelector((state: RootState) => state.modal);
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (biometricAuth.isOpen) {
      setIsScanning(true);
      setScanProgress(0);
      
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setIsScanning(false);
              dispatch(closeBiometricAuth());
              if (biometricAuth.role === 'voter') {
                navigate('/voter-dashboard');
              } else if (biometricAuth.role === 'admin') {
                navigate('/admin-dashboard');
              }
            }, 500);
            return 100;
          }
          return prev + 2;
        });
      }, 40);

      return () => {
        clearInterval(interval);
        setIsScanning(false);
      };
    }
  }, [biometricAuth.isOpen, biometricAuth.role, dispatch, navigate]);

  const handleClose = () => {
    dispatch(closeBiometricAuth());
    setIsScanning(false);
    setScanProgress(0);
  };

  return (
    <Dialog open={biometricAuth.isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto glass-card border-primary/20">
        <div className="flex flex-col items-center space-y-8 p-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold gradient-text">Biometric Authentication</h2>
            <p className="text-muted-foreground">
              Please place your finger on the scanner
            </p>
          </div>

          <div className="relative">
            {/* Fingerprint Icon */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <Fingerprint 
                className={`w-24 h-24 text-primary transition-all duration-300 ${
                  isScanning ? 'fingerprint-scanner blockchain-pulse' : ''
                }`} 
              />
              
              {/* Scanning overlay */}
              {isScanning && (
                <div className="absolute inset-0 rounded-full border-4 border-primary/20">
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-t-primary transition-all duration-100 ease-linear"
                    style={{
                      transform: `rotate(${(scanProgress / 100) * 360}deg)`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Progress indicator */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
              <div className="text-sm font-medium text-primary">
                {scanProgress}%
              </div>
              <div className="w-32 h-2 bg-muted rounded-full mt-2">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-100 ease-linear"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-muted-foreground">
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Scanning fingerprint...</span>
              </>
            ) : (
              <span className="text-sm">Waiting for fingerprint...</span>
            )}
          </div>

          <div className="text-xs text-center text-muted-foreground max-w-xs">
            Accessing {biometricAuth.role} dashboard with biometric verification
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BiometricAuth;