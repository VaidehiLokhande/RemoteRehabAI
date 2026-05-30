import squat from "../../assets/squat.png";
import lunge from "../../assets/lunge.png";
import knee from "../../assets/knee.png";

export default function ExerciseSlider({ setVideo, setExName }) {
  const exercises = [
    { name: "Squat", image: squat, video: "/videos/squat.mp4" },
    { name: "Lunge", image: lunge, video: "/videos/lunge.mp4" },
    { name: "Knee Raise", image: knee, video: "/videos/knee.mp4" }
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {exercises.map((ex, i) => (
        <div
          key={i}
          onClick={() => {
            setVideo(ex.video);     // Video display sathi
            setExName(ex.name);      // AI detection sathi
          }}
          className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer min-w-[130px] transition-all"
        >
          <img src={ex.image} className="h-20 w-full object-cover rounded-lg bg-gray-50 mx-auto" alt={ex.name} />
          <p className="text-center mt-3 font-medium text-gray-700 text-sm">{ex.name}</p>
        </div>
      ))}
    </div>
  );
}