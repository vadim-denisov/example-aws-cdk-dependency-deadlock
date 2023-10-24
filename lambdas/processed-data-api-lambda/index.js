export default handler = async (event, context) => {
    console.log(`Event received: ${event}`)

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
    };
};
