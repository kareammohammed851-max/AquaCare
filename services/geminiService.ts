import { GoogleGenAI, Type } from "@google/genai";

if (!process.env.API_KEY) {
    // In a real app, you'd want to handle this more gracefully.
    // For this example, we'll rely on the environment variable being set.
    console.warn("API_KEY environment variable is not set. Tip and Chat generation will not work.");
}

export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const tipsSchema = {
    type: Type.OBJECT,
    properties: {
        tips: {
            type: Type.ARRAY,
            description: "A list of 5 concise, actionable water-saving tips for households.",
            items: {
                type: Type.STRING,
            }
        }
    },
    required: ["tips"],
};

export const generateWaterSavingTips = async (): Promise<string[]> => {
    if (!process.env.API_KEY) {
         // Return mock data if API key is not available
        return [
            "Turn off the tap while brushing your teeth.",
            "Install water-saving showerheads and faucet aerators.",
            "Only run the washing machine and dishwasher with full loads.",
            "Use a bucket to wash your car instead of a hose.",
            "Check for and repair any leaks in your pipes and toilets.",
        ];
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Generate a list of unique and effective water-saving tips.",
            config: {
                responseMimeType: "application/json",
                responseSchema: tipsSchema,
            },
        });

        const responseText = response.text.trim();
        if (!responseText) {
            throw new Error("Failed to generate tips. The response was empty.");
        }

        const parsedResponse = JSON.parse(responseText);
        return parsedResponse.tips || [];

    } catch (error) {
        console.error("Error generating water saving tips:", error);
        if (error instanceof Error) {
           throw new Error(`Failed to generate tips: ${error.message}`);
        }
        throw new Error("An unexpected error occurred while communicating with the AI model.");
    }
};

export const readWaterMeter = async (base64ImageData: string, mimeType: string): Promise<string> => {
    if (!process.env.API_KEY) {
        console.warn("API_KEY not set. Returning mock data for meter reading.");
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        return "123.45";
    }

    try {
        const imagePart = {
            inlineData: {
                data: base64ImageData,
                mimeType: mimeType,
            },
        };

        const textPart = {
            text: "Analyze the image of a water meter. Extract the main numerical reading. Return only the final number, including decimals if present. For example, if you see '00123.456 m³', return '123.456'. If you cannot determine a number, return an empty string.",
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });
        
        const text = response.text.trim();
        // A simple regex to clean up any extra text from the model
        const match = text.match(/[\d.]+/);
        return match ? match[0] : "";

    } catch (error) {
        console.error("Error reading water meter from image:", error);
        throw new Error("Failed to process image with AI model.");
    }
};