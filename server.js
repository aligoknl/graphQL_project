'use strict';

import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { v4 as uuidv4 } from 'uuid';
import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
} from 'graphql';
import { movieData } from './data/data.js';

const app = express();

let { movies } = movieData;
const MovieType = new GraphQLObjectType({
    name: 'Movie',
    description: 'This represents a movie',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLString) },
        title: { type: GraphQLNonNull(GraphQLString) },
        director: { type: GraphQLNonNull(GraphQLString) },
        release_date: { type: GraphQLNonNull(GraphQLString) },
    }),
});

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        movie: {
            type: MovieType,
            description: 'A single movie',
            args: {
                id: { type: GraphQLString },
            },
            resolve: (parent, args) =>
                movies.find((movie) => movie.id === args.id),
        },
        movies: {
            type: new GraphQLList(MovieType),
            description: 'List of all movies',
            resolve: () => movies,
        },
    }),
});

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addMovie: {
            type: MovieType,
            description: 'Add a movie',
            args: {
                title: { type: GraphQLNonNull(GraphQLString) },
                director: { type: GraphQLNonNull(GraphQLString) },
                release_date: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: (parent, args) => {
                const movie = {
                    id: uuidv4(),
                    title: args.title,
                    director: args.director,
                    release_date: args.release_date,
                };
                movies.push(movie);
                return movie;
            },
        },
        deleteMovie: {
            type: MovieType,
            description: 'Delete a movie',
            args: {
                id: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: (parent, args) => {
                movies = movies.filter((movie) => movie.id !== args.id);
            },
        },
    }),
});

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType,
});

app.use(
    '/graphql',
    graphqlHTTP({
        schema: schema,
        graphiql: true,
    })
);

app.listen(3000, () => console.log('Server running on 3000'));
