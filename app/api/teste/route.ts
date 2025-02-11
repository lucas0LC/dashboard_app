import pdfParse from 'pdf-parse'

export async function POST(request: Request) {
  const buffer = await request.arrayBuffer();
  const stream = Buffer.from(buffer);
  console.log(stream);
  
  
    const pdfData = await pdfParse(stream);
    const text = pdfData.text.trim();
    console.log(text);
    
    return text
}