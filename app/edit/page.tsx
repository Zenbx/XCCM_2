"use client";

import { Suspense } from "react";
import { XCCM2Editor } from "./XCCM2Editor";
import EditorSkeletonView from "./components/EditorSkeletonView";

export default function EditPage() {
  return (
    <Suspense fallback={<EditorSkeletonView />}>
      <XCCM2Editor isEmbedded={false} />
    </Suspense>
  );
}
