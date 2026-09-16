import { Bar } from "../../components/Skeleton";

export default function Loading() {
  return (
    <>
      <Bar className="h-7 w-40 mb-2" />
      <Bar className="h-4 w-80 mb-6" />
      <Bar className="h-64 w-full rounded-xl mb-6" />
      <Bar className="h-40 w-full rounded-xl mb-6" />
      <Bar className="h-52 w-full rounded-xl" />
    </>
  );
}
