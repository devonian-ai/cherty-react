# cherty-react

Component library allowing you to embed Cherty graphs. 

First, use Cherty to build a graph and export its data into a folder in your React app. Then embed a graph element:

const graphMetadataPath = 'src/ExampleGraph/SimpleGraph_metadata.json' // Path to your exported graph data file
...
<ChertyGraph graphMetadataPath={graphMetadataPath} width={300}/>

Gives:

![Screenshot 2024-06-27 at 9 29 38 AM](https://github.com/devonian-ai/cherty-react/assets/39382262/4ade4c57-9249-4081-ac8a-2608bcd17d9f)

With hover over on preview:


![Screenshot 2024-06-27 at 9 30 01 AM](https://github.com/devonian-ai/cherty-react/assets/39382262/16fe82a8-66ea-4aed-80ce-3926a6ed61ce)
