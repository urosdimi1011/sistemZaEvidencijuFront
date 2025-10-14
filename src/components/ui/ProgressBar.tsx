// components/ui/ProgressBar.tsx
import { CircularProgressbar,buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface ProgressBarProps {
    progress: number;
    isLoading: boolean;
}

export const ProgressBar = ({ progress, isLoading }) => {
    // if (!isLoading) return null;

    return (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
            <div className="text-center">
                <div style={{ width: 80, height: 80, margin: '0 auto 20px' }}>
                    <CircularProgressbar
                        value={progress}
                        text={`${progress}%`}
                        styles={buildStyles({
                            textSize: '12px',
                            pathColor: '#10B981',
                            textColor: '#10B981',
                            trailColor: '#E5E7EB'
                        })}
                    />
                </div>
                <p className="text-gray-600 font-medium">
                    {progress < 50 && 'Učitavam aplikaciju...'}
                    {progress >= 50 && progress < 90 && 'Pripremam sadržaj...'}
                    {progress >= 90 && 'Završavam...'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                    Molimo sačekajte
                </p>
            </div>
        </div>
    );
};