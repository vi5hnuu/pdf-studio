import * as React from 'react';
import { BatchRunner } from '@/app/tool/batch/batch-runner';

/**
 * Applies one tool to many PDFs.
 *
 * Every other tool handles a single file, so cleaning up a folder of thirty scans meant thirty
 * trips through the same three steps. The mobile app has had a batch screen for a while; this
 * brings the web to the same standard, over the tools that need no per-file configuration.
 */
export default function Page() {
    return <BatchRunner />;
}
