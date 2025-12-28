import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
  try {
    const tracesPath = path.join(process.cwd(), 'data', 'traces.json');
    
    if (!fs.existsSync(tracesPath)) {
      return NextResponse.json({ traces: [] });
    }
    
    const data = fs.readFileSync(tracesPath, 'utf-8');
    const tracesData = JSON.parse(data);
    
    // Return traces in reverse chronological order
    tracesData.traces = tracesData.traces.reverse();
    
    return NextResponse.json(tracesData);
  } catch (error) {
    console.error('Error reading traces:', error);
    return NextResponse.json({ traces: [], error: 'Failed to load traces' }, { status: 500 });
  }
}
