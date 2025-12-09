import ImageSequence from '@/components/ImageSequence';
import dynamic from 'next/dynamic';

// Dynamic import - code splitting
// const ImageSequence = dynamic(() => import('@/components/ImageSequence'), {
//   ssr: false,
//   loading: () => {
//     return (
//       <div className="h-screen w-full flex items-center justify-center bg-black">
//         <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   },
// });

export default function Home() {
  return (
    <ImageSequence
      frameCount={1461}
      fileNamePrefix="frame_"
      folderPath="/images/sequence-optimized"
    />
  );
}
