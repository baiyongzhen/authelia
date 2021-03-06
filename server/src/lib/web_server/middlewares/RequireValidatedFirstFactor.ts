import Express = require("express");
import BluebirdPromise = require("bluebird");
import ErrorReplies = require("../../ErrorReplies");
import { IRequestLogger } from "../../logging/IRequestLogger";
import { AuthenticationSessionHandler } from "../../AuthenticationSessionHandler";
import Exceptions = require("../../Exceptions");

export class RequireValidatedFirstFactor {
  static middleware(logger: IRequestLogger) {
    return function (req: Express.Request, res: Express.Response,
      next: Express.NextFunction): BluebirdPromise<void> {

      return new BluebirdPromise<void>(function (resolve, reject) {
        const authSession = AuthenticationSessionHandler.get(req, logger);
        if (!authSession.userid || !authSession.first_factor)
          return reject(
            new Exceptions.FirstFactorValidationError(
              "First factor has not been validated yet."));

        next();
        resolve();
      })
        .catch(ErrorReplies.replyWithError401(req, res, logger));
    };
  }
}