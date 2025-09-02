import React from 'react';
import { BookOpenIcon } from 'lucide-react';
interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
}
const Logo = ({
  size = 'md',
  variant = 'full'
}: LogoProps) => {
  const iconSizes = {
    sm: 18,
    md: 24,
    lg: 32
  };
  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };
  return <div className="flex items-center">
      <div className={`rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 p-1.5 flex items-center justify-center shadow-md`}>
        <BookOpenIcon size={iconSizes[size]} className="text-white" />
      </div>
      {variant === 'full' && <div className="flex flex-col ml-2">
          <span className={`font-bold ${textSizes[size]} text-gray-800 leading-tight`}>
            Smart<span className="text-blue-600">Hub</span>
          </span>
          <span className="text-xs text-gray-500 leading-none -mt-1">
            Education • Health • Nutrition
          </span>
        </div>}
    </div>;
};
export default Logo;