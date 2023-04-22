import { ApolloServer, gql } from 'apollo-server';
import fetch from 'node-fetch';

let blogs = [
  { id: '1', text: 'first one', userId: '2' },
  { id: '2', text: 'second one', userId: '1' },
];

let users = [
  {
    id: '1',
    username: 'user name',
  },
  {
    id: '2',
    username: 'Elon Musk',
  },
];

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    password: String!
  }

  type Blog {
    """
    blog object represents a source for a blog
    """
    id: ID!
    text: String!
    author: User!
  }
  type Movie {
    id: Int!
    url: String!
    imdb_code: String!
    title: String!
    title_english: String!
    title_long: String!
    slug: String!
    year: Int!
    rating: Float!
    runtime: Float!
    genres: [String]!
    summary: String
    description_full: String!
    synopsis: String
    yt_trailer_code: String!
    language: String!
    background_image: String!
    background_image_original: String!
    small_cover_image: String!
    medium_cover_image: String!
    large_cover_image: String!
  }

  type Query {
    allMovies: [Movie!]!
    movie(id: String!): Movie!
    allUsers: [User!]!
    allBlogs: [Blog!]!
    blog(id: ID!): Blog
  }

  type Mutation {
    postBlog(text: String!, userId: ID!): Blog!

    """
    Deletes a blog if found, else return false
    """
    deleteBlog(id: ID!): Boolean!
  }
`;

const resolvers = {
  Query: {
    allBlogs() {
      return blogs;
    },
    blog(root, { id }) {
      console.log(args);
      return blogs.find((blog) => blog.id === id);
    },
    allUsers() {
      return users;
    },

    allMovies() {
      return fetch('https://yts.torrentbay.to/api/v2/list_movies.json')
        .then((res) => res.json())
        .then((json) => json.data.movies);
    },
    movie(root, { id }) {
      return fetch(
        `https://yts.torrentbay.to/api/v2/movie_details.json?movie_id=${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
        .then((res) => res.json())
        .then((json) => json.data.movie);
    },
  },

  Mutation: {
    postBlog(_, { text, userId }) {
      const newBlog = {
        id: blogs.length + 1,
        text,
        userId,
      };

      blogs.push(newBlog);
      return newBlog;
    },
    deleteBlog(_, { id }) {
      const blog = blogs.find((blog) => blog.id === id);
      if (!blog) {
        return false;
      }

      blogs = blogs.filter((blog) => blog.id !== id);
      return true;
    },
  },
  User: {
    password({ id, username }) {
      return 'hello';
    },
  },
  Blog: {
    author({ userId }) {
      return users.find((user) => user.id === userId);
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`running on ${url}`);
});
