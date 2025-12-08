import ImageSequence from "@/components/ImageSequence";

export default function Home() {
  return (
    <ImageSequence
      frameCount={1461}
      fileNamePrefix="frame_"
      folderPath="/images/sequence"
    />
  );
}
