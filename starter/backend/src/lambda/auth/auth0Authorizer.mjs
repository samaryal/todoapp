import 'source-map-support/register';

import { verify, decode } from 'jsonwebtoken';
import { createLogger } from '../../utils/logger.js';
import Axios from 'axios';

const logger = createLogger('auth');

const jwksUrl = 'https://dev-he0x1qipr7tp4tzr.us.auth0.com/.well-known/jwks.json';

export const handler = async (event) => {
  logger.info('Authorizing a user', event.authorizationToken);
  try {
    const jwtToken = await verifyToken(event.authorizationToken);
    logger.info('User was authorized', jwtToken);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    };
  } catch (e) {
    logger.error('User not authorized', { error: e.message });

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'allow',
            Resource: '*'
          }
        ]
      }
    };
  }
};

async function verifyToken(authHeader) {
  const token = getToken(authHeader);
  const jwt = decode(token, { complete: true });

  const kid = jwt.header.kid;
  const res = await Axios.get(jwksUrl);
  const publicKey = await getSigninKeys(res.data.keys, kid);

  return verify(token, publicKey, { algorithms: ['RS256'] });
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header');

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header');

  const split = authHeader.split(' ');
  return split[1];
}

function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join('\n');
  return `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
}

async function getSigninKeys(keys, kid) {
  const signinKeys = keys
    .filter(
      (key) =>
        key.use === 'sig' &&
        key.kty === 'RSA' &&
        key.kid &&
        ((key.x5c && key.x5c.length) || (key.n && key.e))
    )
    .map((key) => {
      return {
        kid: key.kid,
        nbf: key.nbf,
        publicKey: certToPEM(key.x5c[0])
      };
    });

  if (!signinKeys || signinKeys.length === 0) {
    logger.error('The JWKS endpoint did not contain any signing keys');
    throw new Error('The JWKS endpoint did not contain any signing keys');
  }

  const signingKey = signinKeys.find((key) => key.kid === kid);

  if (!signingKey) {
    logger.error(`Unable to find a signing key that matches '${kid}'`);
    throw new Error(`Unable to find a signing key that matches '${kid}'`);
  }

  return signingKey.publicKey;
}
