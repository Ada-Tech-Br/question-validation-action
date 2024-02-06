import { DatabaseQuestion } from "@ada-tech-br/questions"
import { Err, Ok } from "cake-result"

type PublishQuestionInput = {
    question: DatabaseQuestion,
    token: string,
    url: string
}

export async function publish(input: PublishQuestionInput) {
    const { question, token, url } = input
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({question}),
            headers: {
                'Content-Type': 'application/json',
                apikey: token
            },
        });

        if (!response.ok) {
            return Err({
                question: question,
                error: getErrorMessageByStatusCode(response)
            })
        }

        return Ok({question});
    } catch (error) {
        return Err({
            question: question,
            error: `Failed to publish question ${question.id}: ${error}`
        });
    }
}



function getErrorMessageByStatusCode(response: Response): {
    type: 'not-found' | 'unauthorized' | 'internal-server-error' | 'unknown-error',
    status: number,
    message: string
} {
    if (response.status === 404) {
        return {
            type: 'not-found',
            status: response.status,
            message: 'Not found'
        };
    }

    if (response.status === 401) {
        return {
            type: 'unauthorized',
            status: response.status,
            message: 'Unauthorized'
        };
    }

    if (response.status === 500) {
        return {
            type: 'internal-server-error',
            status: response.status,
            message: JSON.stringify(response.body)
        };
    }


    return {
        type: 'unknown-error',
        status: response.status,
        message: 'Unknown error occurred'
    };
}